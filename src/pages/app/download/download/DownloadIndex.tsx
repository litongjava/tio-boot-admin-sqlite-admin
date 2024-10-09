import React from 'react';
import JTSDataTableLong from "@/components/common/JTSDataTableLong";
import {downloadColumns} from "@/pages/app/download/download/DownloadColumn";
import {downloadPgr} from "@/pages/app/download/download/DownloadUsService";


export default () => {
  const from = "meituan_app_download";
  return (
    <JTSDataTableLong
      from={from}
      columns={downloadColumns()}
      beforePageRequest={downloadPgr}
    />
  );
};


