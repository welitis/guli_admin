import request from '@/utils/request'

const api_name = '/eduservice/teacher'
export default {

  getPageList(page, limit, searchObj) {
    return request({
      url: `${api_name}/list`,
      method: 'get',
      data: {
        page,
        limit,
        ...searchObj
      }
    })
  }
}
