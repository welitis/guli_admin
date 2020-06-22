import request from '@/utils/request'

const api_name = '/eduservice/chapter'

export default {

  getNestedTreeList(courseId) {
    return request({
      url: `${api_name}/list/${courseId}`,
      method: 'get'
    })
  }
}
