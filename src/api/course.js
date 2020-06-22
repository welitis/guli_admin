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
  }
}
