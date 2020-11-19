import request from '@/utils/request'

export function addModifyRecord(data_temp) {
  return request({
    url: 'yaw_api/modify_record_detail_head',
    method: 'post',
    data:data_temp,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

export function addChildModifyRecord(data_temp) {
  return request({
    url: 'yaw_api/modify_record_detail_body',
    method: 'post',
    data:data_temp,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

export function modifyDefendState(data_temp) {
  return request({
    url: 'yaw_api/modify_record_end',
    method: 'post',
    data:data_temp,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}
