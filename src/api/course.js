import request from '@/utils/request'

const api_name = '/eduservice/course'

export default {
  saveCourseInfo(courseInfo) {
    return request({
      url: `${api_name}/info`,
      method: 'post',
      data: courseInfo
    })
  },
  getCourseInfoById(id) {
    return request({
      url: `${api_name}/info/${id}`,
      method: 'get'
    })
  },
  updateCourseInfoById(courseInfo) {
    return request({
      url: `${api_name}/info`,
      method: 'put',
      data: courseInfo
    })
  },
  getCoursePublishInfoById(id) {
    return request({
      url: `${api_name}/publish/${id}`,
      method: 'get'
    })
  },

  publishCourse(id) {
    return request({
      url: `${api_name}/publish/${id}`,
      method: 'put'
    })
  },
  getPageList(page, limit, searchObj) {
    return request({
      url: `${api_name}/${page}/${limit}`,
      method: 'get',
      params: searchObj
    })
  },
  removeById(id) {
    return request({
      url: `${api_name}/${id}`,
      method: 'delete'
    })
  }
}
