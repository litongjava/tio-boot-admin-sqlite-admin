import React, {useRef, useState} from 'react';
import type {ActionType} from '@ant-design/pro-components';
import {BetaSchemaForm, ProFormText} from "@ant-design/pro-components";
import {Button, message, Modal} from 'antd';
import DataTable from "@/components/common/DataTable";
import {addListColumns} from "@/components/common/proDataColumn";
import DataForm from "@/components/common/DataForm";
import {DeleteOutlined, ExportOutlined, PlusOutlined} from "@ant-design/icons";

type ProDataTableProps = {
  from?: string,
  params?: any
  columns: any[],
  createRequest?: (data: any, from?: string) => Promise<API.Result>,
  deleteRequest?: (data: any, from?: string) => Promise<API.Result>,
  recoveryRequest?: (data: any, from?: string) => Promise<API.Result>,
  batchRemoveRequest?: (data: any, from?: string) => Promise<API.Result>,
  batchRecoveryRequest?: (data: any, from?: string) => Promise<API.Result>,
  pageRequest: (data: any, from?: string) => Promise<API.Result>,
  exportRequest: (data: any, from?: string) => Promise<void>,
  exportAllRequest: (data: any, from?: string) => Promise<void>,
  deletedPageRequest?: (data: any, from?: string) => Promise<API.Result>,
  beforePageRequest?: (params: any, recoveryMode?: boolean) => any
  beforeCreateRequest?: (formValues: any,) => any
  afterCreateRequest?: () => any
  onFormVisibleChange?: (visible: boolean, currentRow: any) => void;
  children?: React.ReactNode;
}

const ProDataTable: React.FC<ProDataTableProps> = ({
                                                     from,
                                                     params,
                                                     columns,
                                                     createRequest,
                                                     deleteRequest,
                                                     recoveryRequest,
                                                     batchRemoveRequest,
                                                     batchRecoveryRequest,
                                                     pageRequest,
                                                     exportAllRequest,
                                                     exportRequest,
                                                     beforePageRequest,
                                                     beforeCreateRequest,
                                                     afterCreateRequest,
                                                     onFormVisibleChange,
                                                     children
                                                   }) => {
    const [messageApi, contextHolder] = message.useMessage();
    const actionRef = useRef<ActionType>();

    const [currentRow, setCurrentRow] = useState<any>();
    const [formTitle, setFormTitle] = useState<string>('');
    const [showDetail, setShowDetail] = useState<boolean>(false);
    const [recoveryMode, setRecoveryMode] = useState<boolean>(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [currentRequestParams, setCurrentRequestParams] = useState<any>();


    const handleModalClose = () => {
      setModalVisible(false);
    };

    const handleCreate = () => {
      setModalVisible(true);
      setCurrentRow(null)
      setFormTitle("New")
    };

    const handleExport = () => {
      try {
        exportRequest(currentRequestParams, from && from);
      } catch (error) {
        messageApi.error('Failed to export');
      }
    };

    const handleExportAll = () => {
      try {
        exportAllRequest(params && params, from && from)
      } catch (error) {
        messageApi.error('Failed to export all');
      }
    }

    const handleModeChange = () => {
      setRecoveryMode(!recoveryMode);
      actionRef.current?.reload();
    }


    const handleShowDetail = (entity: any) => {
      setCurrentRow(entity);
      setShowDetail(true);
    };


    const handleShowEditModal = (record: any) => {
      setCurrentRow(record);
      setModalVisible(true);
      setFormTitle("Edit")
    };

    const onVisibleChange = (visible: boolean) => {
      if (!visible) {
        setModalVisible(visible);
      }

      onFormVisibleChange?.(visible, currentRow);

    }


    const handleDelete = async (id: string) => {
      let title;
      if (recoveryMode) {
        title = 'Are you sure you want to recovery this item?'
      } else {
        title = 'Are you sure you want to delete this item?'
      }
      Modal.confirm({
        title,
        content: 'This action cannot be undone. Please proceed with caution.',
        okText: 'Confirm',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: async () => {
          try {
            let response
            if (recoveryMode) {
              if (recoveryRequest) {
                response = await recoveryRequest(id, from && from);
              }

            } else {
              if (deleteRequest) {
                response = await deleteRequest(id, from && from);
              }
            }

            if (response?.ok) {
              actionRef.current?.reload();
            } else {
              messageApi.error('Failed : ' + response?.msg);
            }


          } catch (error) {
            messageApi.error('Failed ' + error);
          }
        }
      });
    };


    const handleBatchRequest = async (params: any) => {
      try {
        let response;
        if (recoveryMode) {
          if (batchRecoveryRequest) {
            response = await batchRecoveryRequest(params, from && from);
          }
        } else {
          if (batchRemoveRequest) {
            response = await batchRemoveRequest(params, from && from);
          }
        }

        if (response?.ok) {
          actionRef.current?.reload();
          return true;
        } else {
          messageApi.error('Failed to batch ' + response?.msg);
          return false;
        }
      } catch (error) {
        messageApi.error('Failed to batch ' + error);
        return false;
      }
    };


    const handleAdd = async (fields: any) => {
      if (createRequest) {
        const hide = messageApi.loading('updating...');

        try {
          const response = await createRequest({...fields}, from && from);
          hide();
          if (response.ok) {
            return true;
          } else {
            messageApi.error('Fail ' + response.msg);
            return false;
          }
        } catch (error) {
          hide();
          messageApi.error('fail！');
          return false;
        }
      }
      return false;
    };


    const onFormFinish = async (formValues: any) => {
      const hide = messageApi.loading('loading...');
      const postData = beforeCreateRequest ? beforeCreateRequest(formValues) : formValues;
      const success = await handleAdd(postData);
      hide();
      if (success) {
        afterCreateRequest && afterCreateRequest();
        handleModalClose();
        if (actionRef.current) {
          actionRef.current.reload(); //重新加载数据
        }
        return true
      } else {
        messageApi.error("Fail")
        return false;
      }
    };


    const newColumns = addListColumns(columns, handleShowDetail, handleDelete, handleShowEditModal, recoveryMode);

    let request = async (params: any) => {
      const hide = messageApi.loading('loading page data...');
      params = beforePageRequest ? beforePageRequest(params, recoveryMode) : params;
      setCurrentRequestParams(params);
      try {
        const response = await pageRequest(params, from && from);
        hide()
        if (response.ok) {
          return {
            data: response.data.list,
            success: true,
            total: response.data.total,
          };

        } else {
          messageApi.error('fail get page data:' + response.msg);
          return {
            success: false,
          };
        }
      } catch (error) {
        hide()
        messageApi.error('fail error is ' + error);
        return {
          success: false,
        };
      }
    };


    const toolBarRender = () => {

      let toolBars = [];
      if (createRequest) {
        let newButton = <Button icon={<PlusOutlined/>} type="primary" onClick={handleCreate}>New</Button>;
        toolBars.push(newButton);
      }
      let exportButton = <Button icon={<ExportOutlined/>} type="primary" onClick={handleExport}>Export </Button>;
      toolBars.push(exportButton);
      let exportAllButton = <Button icon={<ExportOutlined/>} type="primary" onClick={handleExportAll}>Export All</Button>;
      toolBars.push(exportAllButton);
      let deletedButton = <Button icon={<DeleteOutlined/>} type="primary" onClick={handleModeChange}>
        {recoveryMode ? "Switch to Normal Mode" : "Switch to Recovery Mode"}
      </Button>;
      toolBars.push(deletedButton);
      return toolBars
    }

    return (
      <>
        {contextHolder}
        <DataTable columns={newColumns} actionRef={actionRef} mode={recoveryMode}
                   pageRequest={request}
                   batchRequest={handleBatchRequest}
                   currentRow={currentRow}
                   setCurrentRow={setCurrentRow} showDetail={showDetail} setShowDetail={setShowDetail}
                   toolBarRender={toolBarRender}/>


        <DataForm
          title={formTitle}
          visible={modalVisible}
          formData={currentRow}
          onVisibleChange={onVisibleChange}
          onFinish={onFormFinish}
        >
          <ProFormText name="id" label="id" hidden/>
          <BetaSchemaForm<any>
            layoutType="Embed"
            columns={columns}
            shouldUpdate={(newValues, oldValues) => {
              return newValues.id !== oldValues?.id;
            }}
          />
          {children}
        </DataForm>
      </>
    );
  }
;

export default ProDataTable;
