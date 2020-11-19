import request from '@/utils/request'

export function get_faninfo(data) {
  return request({
    url: '/yaw_api/faninfo',
    method: 'get',
    params:data
  })
}
