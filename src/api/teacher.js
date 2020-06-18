import request from '@/utils/request'

const api_name = '/eduservice/teacher'
export default {
  // 获取讲师列表
  getPageList(page, limit, searchObj) {
    return request({
      url: `${api_name}/list`,
      method: 'get',
      params: {
        pageNo: page,
        limit,
        ...searchObj
      }
    })
  },
  // 删除讲师
  removeById(teacherId) {
    return request({
      url: `${api_name}/${teacherId}`,
      method: 'delete'
    })
  },
  // 新增讲师
  add(teacher) {
    return request({
      url: api_name,
      method: 'post',
      data: teacher
    })
  },
  // 通过id查询讲师
  getById(id) {
    return request({
      url: `${api_name}/${id}`,
      method: 'get'
    })
  },
  // 更新
  updateById(teacher) {
    return request({
      url: `${api_name}`,
      method: 'put',
      data: teacher
    })
  }

}
