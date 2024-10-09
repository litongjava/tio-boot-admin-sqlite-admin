import React, {useState} from 'react';
import ProDataTable from "@/components/common/ProDataTable";
import {UploadFile, UploadProps} from "antd/lib/upload/interface";
import {customUploadToS3} from "@/services/system/systemService";
import UploadFileItem from "@/components/common/UploadFileItem";
import {
  createRequest,
  exportAllRequest,
  exportRequest,
  pageRequest, softBatchRecoveryRequestOfLong, softBatchRemoveRequestOfLong, softRecoveryRequestOfLong,
  softRemoveRequestOfLong
} from "@/utils/jsonToTableSql";

interface JtsDataTableLongProps {
  from: string;
  params?: any
  columns: any;
  maxFiles?: number,
  beforeCreateRequest?: (params: any, containsUpload?: boolean) => any;
  beforePageRequest: (params: any, isRecoveryMode?: boolean, containsUpload?: boolean) => any;
  containsUpload?: boolean;
  containsFileUrl?: boolean;
  uploadCategory?: string;
}

const JTSDataTableLong: React.FC<JtsDataTableLongProps> = ({
                                                             from,
                                                             params,
                                                             columns,
                                                             maxFiles,
                                                             beforeCreateRequest,
                                                             beforePageRequest,
                                                             containsUpload,
                                                             containsFileUrl,
                                                             uploadCategory,
                                                           }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleChange: UploadProps['onChange'] = ({fileList: newFileList}) => {
    setFileList(newFileList);
  }

  const dataTableBeforeCreateRequest = (params: any) => {
    params.id_type = "long";

    if (containsUpload) {
      params.files = fileList.map((file: any) => {
        return {
          uid: file.uid,
          name: file.name,
          status: file.status,
          size: file.size,
          type: file.type,
          id: file.id || file.response?.data.id,
          url: file.url || file.response?.data.url
        }
      });
      params.json_fields = ["files"];
      params.json_fields_type = 'string[]';
    }
    if (beforeCreateRequest) {
      return beforeCreateRequest(params, containsUpload)
    } else {
      return params;
    }
  }

  const afterCreateRequest = () => {
    setFileList([])
  }

  const onFormVisibleChange = (visible: boolean, currentRow: any) => {
    if (visible) {
      if (currentRow && currentRow.files) {
        setFileList(currentRow.files);
      } else {
        setFileList([]);
      }
    }
  }

  const customUploadRequest = (options: any) => {
    if (uploadCategory) {
      return customUploadToS3(uploadCategory, options);
    } else {
      return customUploadToS3("default", options);
    }
  };

  const dataTableBeforePageRequest = (params: any, recoveryMode?: boolean) => {
    return beforePageRequest(params, recoveryMode, containsUpload)
  }
  return (
    <ProDataTable from={from} params={params} columns={columns}
                  createRequest={createRequest}
                  pageRequest={pageRequest}
                  exportRequest={exportRequest}
                  exportAllRequest={exportAllRequest}
                  deleteRequest={softRemoveRequestOfLong}
                  recoveryRequest={softRecoveryRequestOfLong}
                  batchRemoveRequest={softBatchRemoveRequestOfLong}
                  batchRecoveryRequest={softBatchRecoveryRequestOfLong}
                  beforePageRequest={dataTableBeforePageRequest}
                  beforeCreateRequest={dataTableBeforeCreateRequest}
                  afterCreateRequest={afterCreateRequest}
                  onFormVisibleChange={onFormVisibleChange}>
      {containsUpload && (
        <UploadFileItem label="Files" max={maxFiles} name="urls" fileList={fileList} onChange={handleChange}
                        customRequest={customUploadRequest}/>
      )}

      {containsFileUrl && (
        <div>
          <div>Urls:</div>
          {fileList && fileList
            .map((file) => file.url || file.response?.data.url)
            .filter((url) => url !== undefined)
            .map((url, index) => (
              <div key={index}>
                <a href={url} target="_blank">{url}</a>
              </div>
            ))}
        </div>
      )}
    </ProDataTable>
  );
};

export default JTSDataTableLong;
