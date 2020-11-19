import request from '@/utils/request'

// 获取路由
export function getRouters(param) {
  return request({
    url: 'api/user/route',
    method: 'get',
    // params: { param }
  })
}

export function login(data) {
  return request({
    url: '/vue-element-admin/user/login',
    method: 'post',
    data
  })
}
