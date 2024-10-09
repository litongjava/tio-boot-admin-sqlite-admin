import React from 'react';
import type {ProColumns} from '@ant-design/pro-components';
import {Upload} from 'antd';

export const addListColumns = (
  columns: ProColumns<any>[],
  handleShowDetail: (record: any) => void,
  handleDelete: (id: string) => Promise<void>,
  handleShowEditModal: (record: any) => void,
  recoveryMode?: boolean
): ProColumns<any>[] => [
  {
    title: 'Id',
    dataIndex: 'id',
    copyable: true,
    ellipsis: true,
    width: 70,
    fixed: 'left',
    render: (dom, entity) => {
      return (
        <a
          onClick={() => handleShowDetail(entity)}
        >
          {dom}
        </a>
      );
    },
  },
  ...columns,
  {
    title: 'Operation',
    valueType: 'option',
    width: 100,
    fixed: 'right',
    render: (text, record) => [
      <a key="edit" onClick={() => handleShowEditModal(record)}>Edit</a>,
      <a key="delete" onClick={() => handleDelete(record.id)}>
        {recoveryMode ? "Recovery" : "Delete"}
      </a>,
    ],
  },
];
