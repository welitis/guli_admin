<!-- 新增课程 -->
<template>
  <div class="app-container">
    <h2 style="text-align: center;">发布新课程</h2>

    <el-steps :active="active" finish-status="success" align-center style="margin-bottom: 40px;">
      <el-step title="填写课程基本信息" />
      <el-step title="创建课程大纲" />
      <el-step title="提交审核" />
    </el-steps>
    <!-- 课程信息 -->
    <el-form v-if="infoShow" ref="infoRuleForm" :model="courseInfo" :rules="rules" label-width="120px" >
      <el-form-item label="课程标题" prop="title">
        <el-input v-model="courseInfo.title" placeholder=" 示例：机器学习项目课：从基础到搭建项目视频课程。专业名称注意大小写"/>
      </el-form-item>

      <!-- 所属分类 TODO -->

      <!-- 课程讲师 TODO -->

      <el-form-item label="总课时">
        <el-input-number :min="0" v-model="courseInfo.lessonNum" controls-position="right" placeholder="请填写课程的总课时数"/>
      </el-form-item>

      <!-- 课程简介 TODO -->

      <!-- 课程封面 TODO -->

      <el-form-item label="课程价格">
        <el-input-number :min="0" v-model="courseInfo.price" controls-position="right" placeholder="免费课程请设置为0元"/> 元
      </el-form-item>
      <el-form-item>
        <el-button :disabled="saveBtnDisabled" type="primary" @click="next('infoRuleForm')">保存并下一步</el-button>
      </el-form-item>
    </el-form>

    <el-form v-if="chapterShow" label-width="120px">
      课程大纲
      <el-form-item>
        <el-button @click="previous">上一步</el-button>
        <el-button :disabled="saveBtnDisabled" type="primary" @click="next">下一步</el-button>
      </el-form-item>
    </el-form>

  </div>
</template>
<script>
import course from '@/api/course'

const defaultForm = {
  title: '',
  subjectId: '',
  teacherId: '',
  lessonNum: 0,
  description: '',
  cover: '',
  price: 0
}

export default {
  data() {
    return {
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
  },
  methods: {
    next(formName) {
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
      // 根据active的值判断当前是什么信息提交
      // active：0 课程信息提交
      // active: 1 课程大纲提交
      //
      let result
      if (!this.courseInfo.id) {
        result = this.saveData()
      } else {
        result = this.updateData()
      }
      if (result) { // 保存成功进入下一步
        this.active++
        if (this.active === 1) {
          console.log('进入课程大纲页面')
          this.infoShow = false
          this.chapterShow = true
        } else if (this.active === 2) {
          console.log('进入课程发布页面')
          this.chapterShow = false
          this.publishShow = true
        }
      }
    },
    // 保存
    saveData() {
      course.saveCourseInfo(this.courseInfo).then(response => {
        this.$message({
          type: 'success',
          message: '保存成功!'
        })
        this.courseInfo.id = response.data.courseId
        console.log('保存成功，获取到的courseId' + this.courseInfo.id)
        return true
      }).catch((response) => {
        return false
      })
    },

    updateData() {
      this.$router.push({ path: '/edu/course/chapter/1' })
    }
  }
}
</script>
