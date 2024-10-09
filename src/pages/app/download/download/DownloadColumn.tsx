import {ProColumns} from '@ant-design/pro-components';

export const downloadColumns = (): ProColumns<any>[] => [
  {
    "title": "Android",
    "dataIndex": "android_link",
    "valueType": "text"
  },
  {
    "title": "IOS",
    "dataIndex": "ios_link",
    "valueType": "text"
  },
  {
    title: "Remark",
    dataIndex: "remark",
    valueType: "text",
  },
  {
    "title": "Creator",
    "dataIndex": "creator",
    "valueType": "text",
    hideInForm: true,
  },
  {
    title: 'Update Time',
    dataIndex: 'update_time',
    valueType: 'dateTime',
    hideInSearch: true,
    hideInForm: true,
  },
  {
    title: 'Update Time',
    key: 'update_time',
    dataIndex: 'update_time_range',
    valueType: 'dateTimeRange',
    hideInTable: true,
    hideInForm: true,
    hideInDescriptions: true,
  },
];
