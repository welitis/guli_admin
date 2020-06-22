<!-- 新增课程 -->
<template>
  <div class="app-container">
    <h2 style="text-align: center;">发布新课程</h2>

    <el-steps :active="active" :process-status="processStatus" finish-status="success" align-center style="margin-bottom: 40px;">
      <el-step title="填写课程基本信息" />
      <el-step title="创建课程大纲" />
      <el-step title="提交审核" />
    </el-steps>
    <!-- 课程信息 -->
    <el-form v-if="infoShow" ref="infoRuleForm" :model="courseInfo" :rules="rules" label-width="120px" >
      <el-form-item label="课程标题" prop="title">
        <el-input v-model="courseInfo.title" placeholder=" 示例：机器学习项目课：从基础到搭建项目视频课程。专业名称注意大小写"/>
      </el-form-item>

      <!-- 所属分类 级联框 TODO -->
      <el-form-item label="课程分类" prop="subjectId">
        <div class="block">
          <el-cascader
            v-model="value"
            :options="options"
            :props="props"
            @change="handleChange"/>
        </div>
      </el-form-item>

      <!-- 课程讲师 回显下拉框 TODO -->
      <el-form-item label="课程讲师" prop="teacherId">
        <el-select v-model="courseInfo.teacherId" placeholder="选择讲师">
          <el-option v-for="teacher in teacherList" :key="teacher.id" :label="teacher.name" :value="teacher.id"/>
        </el-select>
      </el-form-item>

      <el-form-item label="总课时">
        <el-input-number :min="0" v-model="courseInfo.lessonNum" controls-position="right" placeholder="请填写课程的总课时数"/>
      </el-form-item>

      <!-- 课程简介 富文本 TODO -->
      <el-form-item label="课程简介">
        <tinymce :height="300" v-model="courseInfo.description"/>
      </el-form-item>

      <!-- 课程封面 图片上传 TODO -->
      <!-- 课程封面-->
      <el-form-item label="课程封面">

        <el-upload
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
          :action="BASE_API + 'common/upload'"
          class="avatar-uploader">
          <img :src="courseInfo.cover">
        </el-upload>

      </el-form-item>

      <el-form-item label="课程价格">
        <el-input-number :min="0" v-model="courseInfo.price" controls-position="right" placeholder="免费课程请设置为0元"/> 元
      </el-form-item>
      <el-form-item>
        <el-button :disabled="saveBtnDisabled" type="primary" @click="infoNext('infoRuleForm')">保存并下一步</el-button>
      </el-form-item>
    </el-form>

    <!-- 课程大纲 -->
    <el-form v-if="chapterShow" label-width="120px">
      课程大纲
      <el-form-item>
        <el-button @click="chapterPrevious">上一步</el-button>
        <el-button :disabled="saveBtnDisabled" type="primary" @click="chapterNext">下一步</el-button>
      </el-form-item>
    </el-form>

  </div>
</template>
<script>
import course from '@/api/course'
import subject from '@/api/subject'
import teacher from '@/api/teacher'
import chapter from '@/api/chapter'
import Tinymce from '@/components/Tinymce'

const defaultForm = {
  title: '',
  subjectId: '',
  teacherId: '',
  lessonNum: 0,
  description: '',
  cover: process.env.OSS_PATH + '/avatar/default.png', // 封面
  price: 0
}

export default {
  components: { Tinymce },
  data() {
    return {
      chapterNestedList: [], // 章节嵌套课时列表
      processStatus: 'process', // 当前步骤条的状态
      BASE_API: process.env.BASE_API, // 接口API地址
      teacherList: [], // 讲师列表
      // 级联选择框的属性
      props: {
        value: 'id',
        label: 'title'
      },
      value: [],
      options: [], // 级联选择框的参数
      infoShow: true,
      chapterShow: false,
      active: 0,
      courseInfo: { ...defaultForm },
      saveBtnDisabled: false, // 保存按钮是否禁用
      rules: {
        title: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    console.log('info created')
    // 获取所有分类节点
    this.fetchNodeList()
    // 获取讲师列表
    this.initTeacherList()
  },
  methods: {
    test() {
      console.log(this.courseInfo)
    },
    // 课程章节初始化
    chapterInit() {
      if (this.$route.params && this.$route.params.id) {
        this.courseId = this.$route.params.id
        // 根据id获取课程基本信息
        this.fetchChapterNestedListByCourseId()
      }
    },

    fetchChapterNestedListByCourseId() {
      chapter.getNestedTreeList(this.courseId).then(response => {
        this.chapterNestedList = response.data.items
      })
    },

    // 回显课程信息
    fetchCourseInfoById(id) {
      course.getCourseInfoById(id).then(response => {
        this.courseInfo = response.data.item
      }).catch((response) => {
        this.$message({
          type: 'error',
          message: response.message
        })
      })
    },

    handleAvatarSuccess(res, file) {
      console.log(res)// 上传响应
      console.log(URL.createObjectURL(file.raw))// base64编码
      this.courseInfo.cover = res.data.url
    },

    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    // 初始化讲师列表方法
    initTeacherList() {
      teacher.getList().then(response => {
        this.teacherList = response.data.items
      })
    },
    handleChange(value) { // 级联选择框事件函数
    // 为课程信息对象的课程分类id赋值
      if (value.length > 0) {
        console.log(value)
        this.courseInfo.subjectId = value[value.length - 1] // 取最后一个值的id
      }
    },

    // 获取学科分类
    fetchNodeList() {
      subject.getNestedTreeList().then(response => {
        if (response.success === true) {
          this.options = response.data.items
        }
      })
    },
    chapterPrevious() { // 课程大纲的上一步
      if (!window.courseId) {
        this.$message({
          type: 'error',
          message: '课程信息内容丢失！'
        })
      } else {
        // 回显数据
        this.fetchCourseInfoById(window.courseId)
        this.active--
        this.chapterShow = false
        this.infoShow = true
      }
    },
    chapterNext() {

    },
    infoNext(formName) { // 课程信息页的下一页按钮事件
      // 验证表单内容
      let validResult = false // 验证结果
      this.$refs[formName].validate(valid => {
        validResult = valid
      })
      if (!validResult) {
        // 验证不通过直接返回
        return
      }

      // 锁定下一步按钮，保存成功后释放
      this.saveBtnDisabled = true
      if (!window.courseId) {
        // 没有courseId，表示没有提交过信息，是第一次提交
        this.saveInfoData()
      } else {
        this.updateInfoData()
      }
    },

    // 保存课程信息
    saveInfoData() {
      course.saveCourseInfo(this.courseInfo).then(response => {
        this.$message({
          type: 'success',
          message: '保存成功!'
        })
        this.courseInfo.id = response.data.courseId
        console.log('保存成功，获取到的courseId' + this.courseInfo.id)
        this.active++
        this.saveBtnDisabled = false
        // 保存课程信息id到全局，防止在课程大纲刷新后无法回到上一步修改课程信息
        window.courseId = this.courseInfo.id
        console.log('进入课程大纲页面')
        this.infoShow = false
        this.chapterShow = true
        // 初始化课程大纲页面 TODO
      }).catch((response) => {
        this.$message({
          type: 'error',
          message: '保存失败!'
        })
        console.log(response.message)
        this.processStatus = 'error'
      })
    },

    // 更新课程信息
    updateInfoData() {
      this.saveBtnDisabled = true
      this.courseInfo.id = window.courseId
      course.updateCourseInfoById(this.courseInfo).then(response => {
        this.$message({
          type: 'success',
          message: '修改成功!'
        })
        console.log('修改成功，获取到的courseId' + this.courseInfo.id)
        this.active++
        this.saveBtnDisabled = false
        // 保存课程信息id到全局，防止在课程大纲刷新后无法回到上一步修改课程信息
        window.courseId = this.courseInfo.id
        this.infoShow = false
        this.chapterShow = true
        console.log('进入课程大纲页面')
        // 初始化课程大纲页面 TODO
      }).catch((response) => {
        // console.log(response)
        this.$message({
          type: 'error',
          message: '保存失败'
        })
        console.log(response.message)
        this.processStatus = 'error'
      })
    }
  }
}
</script>
<style scoped>
.tinymce-container {
  line-height: 29px;
}
</style>
