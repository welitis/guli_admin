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
          :action="BASE_API + 'oss/file/upload'"
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
      <el-button type="text" @click="dialogChapterFormVisible = true">添加章节</el-button>
      <!-- 章节 -->
      <ul class="chanpterList">
        <li
          v-for="chapter in chapterNestedList"
          :key="chapter.id">
          <p>
            {{ chapter.title }}

            <span class="acts">
              <el-button type="text" @click="dialogVideoFormVisible = true; chapterId = chapter.id">添加课时</el-button>
              <el-button type="text" @click="editChapter(chapter.id)">编辑</el-button>
              <el-button type="text" @click="removeChapter(chapter.id)">删除</el-button>
            </span>
          </p>

          <!-- 视频 -->
          <ul class="chanpterList videoList">
            <li
              v-for="video in chapter.children"
              :key="video.id">
              <p>{{ video.title }}
                <span class="acts">
                  <el-button type="text" @click="editVideo(video.id)">编辑</el-button>
                  <el-button type="text" @click="removeVideo(video.id)">删除</el-button>
                </span>
              </p>
            </li>
          </ul>
        </li>
      </ul>
      <div>
        <el-button @click="chapterPrevious">上一步</el-button>
        <el-button :disabled="saveBtnDisabled" type="primary" @click="chapterNext">下一步</el-button>
      </div>
    </el-form>
    <!-- 添加和修改章节表单 -->
    <el-dialog :visible.sync="dialogChapterFormVisible" title="添加章节">
      <el-form :model="chapter" label-width="120px">
        <el-form-item label="章节标题">
          <el-input v-model="chapter.title"/>
        </el-form-item>
        <el-form-item label="章节排序">
          <el-input-number v-model="chapter.sort" :min="0" controls-position="right"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogChapterFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveOrUpdateChapter">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 添加和修改课时表单 -->
    <el-dialog :visible.sync="dialogVideoFormVisible" title="添加课时">
      <el-form :model="video" label-width="120px">
        <el-form-item label="课时标题">
          <el-input v-model="video.title"/>
        </el-form-item>
        <el-form-item label="课时排序">
          <el-input-number v-model="video.sort" :min="0" controls-position="right"/>
        </el-form-item>
        <el-form-item label="是否免费">
          <el-radio-group v-model="video.free">
            <el-radio :label="true">免费</el-radio>
            <el-radio :label="false">默认</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="上传视频">
          <!-- TODO -->
          <el-upload
            :on-success="handleVodUploadSuccess"
            :on-remove="handleVodRemove"
            :before-remove="beforeVodRemove"
            :on-exceed="handleUploadExceed"
            :file-list="fileList"
            :action="BASE_API+'vod/video/upload'"
            :limit="1"
            class="upload-demo">
            <el-button size="small" type="primary">上传视频</el-button>
            <el-tooltip placement="right-end">
              <div slot="content">最大支持1G，<br>
                支持3GP、ASF、AVI、DAT、DV、FLV、F4V、<br>
                GIF、M2T、M4V、MJ2、MJPEG、MKV、MOV、MP4、<br>
                MPE、MPG、MPEG、MTS、OGG、QT、RM、RMVB、<br>
                SWF、TS、VOB、WMV、WEBM 等视频格式上传</div>
              <i class="el-icon-question"/>
            </el-tooltip>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVideoFormVisible = false">取 消</el-button>
        <el-button :disabled="saveVideoBtnDisabled" type="primary" @click="saveOrUpdateVideo">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 课程发布 -->
    <el-form v-if="publishShow" label-width="120px">
      <div class="ccInfo">
        <img :src="coursePublish.cover">
        <div class="main">
          <h2>{{ coursePublish.title }}</h2>
          <p class="gray"><span>共{{ coursePublish.lessonNum }}课时</span></p>
          <p><span>所属分类：{{ coursePublish.subjectLevel }}</span></p>
          <p>课程讲师：{{ coursePublish.teacherName }}</p>
          <h3 class="red">￥{{ coursePublish.price }}</h3>
        </div>
      </div>

      <div>
        <el-button @click="previousPublish">返回修改</el-button>
        <el-button :disabled="saveBtnDisabled" type="primary" @click="publish">发布课程</el-button>
      </div>
    </el-form>
  </div>
</template>
<script>
import course from '@/api/course'
import subject from '@/api/subject'
import teacher from '@/api/teacher'
import chapter from '@/api/chapter'
import video from '@/api/video'
import Tinymce from '@/components/Tinymce'
import vod from '@/api/vod'

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
      fileList: [], // 上传文件列表
      publishShow: false,
      publishBtnDisabled: false, // 保存按钮是否禁用
      courseId: '', // 所属课程
      coursePublish: {},
      saveVideoBtnDisabled: false, // 课时按钮是否禁用
      dialogVideoFormVisible: false, // 是否显示课时表单
      chapterId: '', // 课时所在的章节id
      video: {// 课时对象
        title: '',
        sort: 0,
        free: 0,
        videoSourceId: '',
        videoOriginalName: ''
      },
      dialogChapterFormVisible: false, // 是否显示章节表单
      chapter: {// 章节对象
        title: '',
        sort: 0
      },
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
    if (window.courseId) {
      // 回显数据
      this.fetchCourseInfoById(window.courseId)
      // this.active--
      this.chapterShow = false
      this.infoShow = true
    }
    // 获取所有分类节点
    this.fetchNodeList()
    // 获取讲师列表
    this.initTeacherList()
  },
  methods: {
    test() {
      console.log(this.courseInfo)
    },
    beforeVodRemove(file, fileList) {
      console.log(fileList)
      return this.$confirm(`确定移除 ${file.name}?`)
    },
    handleVodRemove(file, fileList) {
      vod.removeById(this.video.videoSourceId).then(response => {
        this.$message({
          type: 'success',
          message: response.message
        })
        this.video.videoOriginalName = ''
        this.video.videoSourceId = ''
        this.fileList = []
      })
    },
    // 成功回调
    handleVodUploadSuccess(response, file, fileList) {
      this.video.videoSourceId = response.data.videoId
      this.video.videoOriginalName = file.name
    },
    // 视图上传多于一个视频
    handleUploadExceed(files, fileList) {
      this.$message.warning('想要重新上传视频，请先删除已上传的视频')
    },
    publishInit() {
      if (window.courseId) {
        this.courseInfo.id = window.courseId
        // 根据id获取课程基本信息
        this.fetchCoursePublishInfoById()
      }
    },
    publish() {
      console.log('publish courseId: ' + this.courseInfo.id)
      console.log(typeof (this.courseInfo.id))
      course.publishCourse(this.courseInfo.id).then(response => {
        this.$message({
          type: 'success',
          message: '发布成功'
        })
        delete window.courseId // 删除全局课程id
        this.$router.push({ path: '/course/list' })
      })
    },
    previousPublish() {
      if (!window.courseId) {
        this.$message({
          type: 'error',
          message: '课程信息内容丢失！'
        })
      } else {
        // 回显数据
        this.fetchChapterNestedListByCourseId()
        this.active--
        this.chapterShow = true
        this.publishShow = false
        console.log('进入课程大纲页面')
        // 初始化课程大纲页面 TODO
        this.chapterInit()
      }
    },

    fetchCoursePublishInfoById() {
      course.getCoursePublishInfoById(this.courseInfo.id).then(response => {
        this.coursePublish = response.data.item
      })
    },
    removeVideo(videoId) {
      this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return video.removeById(videoId)
      }).then(() => {
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        // 删除小节后清空this.video
        this.helpSaveVideo()
      }).catch((response) => { // 失败
        if (response === 'cancel') {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        } else {
          this.$message({
            type: 'error',
            message: response.message
          })
        }
      })
    },
    editVideo(videoId) {
      this.dialogVideoFormVisible = true
      video.getVideoInfoById(videoId).then(response => {
        this.video = response.data.item
        this.fileList = [{ 'name': this.video.videoOriginalName }]
      })
    },
    saveOrUpdateVideo() {
      this.saveVideoBtnDisabled = true
      if (!this.video.id) {
        console.log('保存视频')
        console.log(this.video)
        this.saveDataVideo()
      } else {
        console.log('更新视频')
        this.updateDataVideo()
      }
    },

    saveDataVideo() {
      this.video.courseId = this.courseInfo.id
      this.video.chapterId = this.chapterId
      video.saveVideoInfo(this.video).then(response => {
        this.$message({
          type: 'success',
          message: '保存成功!'
        })
        this.helpSaveVideo()
      })
    },

    updateDataVideo() {
      video.updateVideoInfoById(this.video).then(response => {
        this.$message({
          type: 'success',
          message: '修改成功!'
        })
        this.helpSaveVideo()
      })
    },

    helpSaveVideo() {
      this.dialogVideoFormVisible = false// 如果保存成功则关闭对话框
      this.fetchChapterNestedListByCourseId()// 刷新列表
      this.saveVideoBtnDisabled = false
      this.video = { // 重置video
        title: '',
        sort: 0,
        free: 0,
        videoSourceId: '',
        videoOriginalName: ''
      }
      this.fileList = [] // 清空文件列表
    },
    removeChapter(chapterId) {
      this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        chapter.removeById(chapterId).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.fetchChapterNestedListByCourseId()// 刷新列表
        })
      }).catch((response) => { // 失败
        if (response === 'cancel') {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        }
      })
    },

    editChapter(chapterId) {
      this.dialogChapterFormVisible = true
      chapter.getById(chapterId).then(response => {
        this.chapter = response.data.item
      })
    },
    saveOrUpdateChapter() {
      this.saveBtnDisabled = true
      if (!this.chapter.id) {
        console.log('保存章节')
        this.saveChapterData()
      } else {
        console.log('更新章节')
        this.updateChapterData()
      }
    },

    saveChapterData() {
      this.chapter.courseId = window.courseId
      chapter.save(this.chapter).then(response => {
        this.$message({
          type: 'success',
          message: '保存成功!'
        })
        this.helpSave()
      }).catch((response) => {
        this.$message({
          type: 'error',
          message: response.message
        })
      })
    },

    updateChapterData() {
      chapter.updateById(this.chapter).then(response => {
        this.$message({
          type: 'success',
          message: '修改成功!'
        })
        this.helpSave()
      }).catch((response) => {
        // console.log(response)
        this.$message({
          type: 'error',
          message: response.message
        })
      })
    },
    helpSave() {
      this.dialogChapterFormVisible = false// 如果保存成功则关闭对话框
      this.fetchChapterNestedListByCourseId()// 刷新列表
      this.chapter.title = ''// 重置章节标题
      this.chapter.sort = 0// 重置章节标题
      this.saveBtnDisabled = false
    },

    // 课程章节初始化
    chapterInit() {
      if (window.courseId) {
        this.courseInfo.courseId = window.courseId
        // this.courseInfo.courseId = '1192252213659774977'
        // 根据id获取课程基本信息
        this.fetchChapterNestedListByCourseId()
      }
    },

    fetchChapterNestedListByCourseId() {
      chapter.getNestedTreeList(this.courseInfo.courseId).then(response => {
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
      console.log('进入发布页面')
      this.active++
      this.publishShow = true
      this.chapterShow = false
      this.publishInit()
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
        console.log('保存课程信息')
        this.saveInfoData()
      } else {
        console.log('更新课程信息')
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
        this.chapterInit()
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
        this.chapterInit()
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

.chanpterList{
    position: relative;
    list-style: none;
    margin: 0;
    padding: 0;
}
.chanpterList li{
  position: relative;
}
.chanpterList p{
  float: left;
  font-size: 20px;
  margin: 10px 0;
  padding: 10px;
  height: 70px;
  line-height: 50px;
  width: 100%;
  border: 1px solid #DDD;
}
.chanpterList .acts {
    float: right;
    font-size: 14px;
}

.videoList{
  padding-left: 50px;
}
.videoList p{
  float: left;
  font-size: 14px;
  margin: 10px 0;
  padding: 10px;
  height: 50px;
  line-height: 30px;
  width: 100%;
  border: 1px dotted #DDD;
}
.ccInfo {
    background: #f5f5f5;
    padding: 20px;
    overflow: hidden;
    border: 1px dashed #DDD;
    margin-bottom: 40px;
    position: relative;
}
.ccInfo img {
    background: #d6d6d6;
    width: 500px;
    height: 278px;
    display: block;
    float: left;
    border: none;
}
.ccInfo .main {
    margin-left: 520px;
}

.ccInfo .main h2 {
    font-size: 28px;
    margin-bottom: 30px;
    line-height: 1;
    font-weight: normal;
}
.ccInfo .main p {
    margin-bottom: 10px;
    word-wrap: break-word;
    line-height: 24px;
    max-height: 48px;
    overflow: hidden;
}

.ccInfo .main p {
    margin-bottom: 10px;
    word-wrap: break-word;
    line-height: 24px;
    max-height: 48px;
    overflow: hidden;
}
.ccInfo .main h3 {
    left: 540px;
    bottom: 20px;
    line-height: 1;
    font-size: 28px;
    color: #d32f24;
    font-weight: normal;
    position: absolute;
}
</style>
