export const downloadPgr = (params: any, isRecoveryMode?: boolean, containsUpload?: boolean) => {
  params.idType = 'long';
  params.remarkOp = "ct";
  params.orderBy = "update_time";
  params.update_time_type = "string[]";
  params.update_time_op = "bt";
  params.update_time_to_type = "ISO8601";

  if (isRecoveryMode) {
    params.deleted = 1
  } else {
    params.deleted = 0
  }


  params.ios_link_op = "ct";
  params.android_link_op = "ct";


  return params;
}
