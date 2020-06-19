import request from '@/utils/request'

const api_name = '/eduservice/subject'

export default {

  getNestedTreeList() {
    return request({
      url: `${api_name}/list`,
      method: 'get'
    })
  }
}
