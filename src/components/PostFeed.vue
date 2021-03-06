<template>
  <transition name="custom-classes-transition" enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown">
    <div class="post-feed" :class="$style.postRoot" v-show="show">
      <div class="commonHeader">
        <Row :gutter="16">
          <Col span="4">
            <Button :class="$style.actionBtn" type="text" @click="closePost">取消</Button>
          </Col>
          <Col span="15" class="title-col">
            发布动态
          </Col>
          <Col span="5" class="header-end-col">
            <span :class="{ action: !isDisabled, notAction: isDisabled}" @click="postFeed">发布</span>
          </Col>
        </Row>
      </div>
      <div :class="$style.content">
        <Row :gutter="16">
          <Col span="24" style="padding-left: 8px; padding-right: 8px;">
            <Input style="border-bottom: 1px #e2e3e3 solid;" v-model="feedTitle" placeholder="有标题更吸引人" :class="$style.contentInput"></Input>
            <Input v-model="feedContent" :autosize="{minRows: 6, maxRows: 12}" type="textarea" :class="$style.contentInput" placeholder="输入要说的话,图文结合更精彩哦"></Input>
          </Col>
        </Row>
      </div>
      <div :class="$style.upload">
        <template>
          <div :class="$style.uploadList">
            <div class="demo-upload-list" v-for="(item, index) in imageList">
              <template v-if="item.status === 'finished'">
                  <img :src="item.url" :alt="item.name" >
                  <div class="demo-upload-list-cover">
                    <CloseIcon height="21" width="21" color="#f00" style="position: absolute; right:0; top: 0;" @click.native="handleRemove(index)" />
                    <EyeOpenIcon height="21" width="21" color="#59b6d7" @click.native="handleView(index)" />
                  </div>
              </template>
              <template v-else>
                <!-- <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress> -->
                <i-circle v-if="item.showProgress" :percent="item.percentage">
                  <span class="demo-i-circle-inner" style="font-size:24px">{{item.percentage}}%</span>
                </i-circle>
              </template>
            </div>
            <Upload
              ref="upload"
              :show-upload-list="false"
              :default-file-list="defaultList"
              :on-success="handleSuccess"
              :format="format"
              :max-size="maxSize"
              :on-format-error="handleFormatError"
              :on-exceeded-size="handleMaxSize"
              :before-upload="handleBeforeUpload"
              multiple
              :headers="headers"
              :data="uploadData"
              type="drag"
              :action="uploadUri"
              accept="image/*"
              style="display: inline-block;width:22vw;height: 22vw; margin: .5vw;">
              <div :class="$style.camera">
                  <CameraIcon height="24" width="24" color="#999" />
              </div>
            </Upload>
            <Modal title="查看图片" v-model="visible">
                <img :src="uploadList[imgName].url" v-if="visible" style="width: 100%">
            </Modal>
          </div>
        </template>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapState } from 'vuex';
import { SHOWPOST, NOTICE, ADDFOLLOWINGIDS, ADDNEWIDS, FEEDSLIST } from '../stores/types';
import { createAPI, addAccessToken } from '../utils/request';
import localEvent from '../stores/localStorage';
import { Base64 } from 'js-base64';
import md5 from 'js-md5';
import { createUploadTask, uploadFile, noticeTask } from '../utils/upload';
import lodash from 'lodash';
import CameraIcon from '../icons/Camera';
import CloseIcon from '../icons/Close';
import EyeOpenIcon from '../icons/EyeOpen';

const base64Reg = /^data:(.*?);base64,/;
let reg = /data:(.*?);/;
const postFeed = {
  components: {
    CameraIcon,
    CloseIcon,
    EyeOpenIcon
  },
  data: () => ({
    feedTitle: '',
    feedContent: '',
    isatuser: 0,
    uploadList: [],
    defaultList: [],
    imgName: '',
    visible: false,
    uploadHeaders: {},
    storage_task_ids: [],
    uploadUri: '',
    uploadData: {},
    headers: {},
    ids: {},
    format: ['jpg','jpeg','png'],
    maxSize: 10240
  }),
  computed: {
    ...mapState({
      show: state => state.showPost.showPost.show
    }),
    isDisabled () {
      return !this.feedContent.length;
    },
    imageList () {
      let imglist = [];
      this.uploadList.forEach( img => {
        if(this.ids[img.name])
          imglist.push({
            status: img.status,
            name: img.name,
            url: this.ids[img.name].url,
            percentage: parseInt(img.percentage) || 0,
            showProgress: img.showProgress
          })
      });
      return imglist;
    }
  },
  methods: {
    postFeed () {
      let feed_content = this.feedContent;
      let feed_title = this.feedTitle;
      let feed_from = 2;
      let isatuser = this.isatuser;
      let storage_task_ids = this.storage_task_ids;
      addAccessToken().post(createAPI('feeds'),{
          feed_content,
          feed_title,
          feed_from,
          isatuser,
          storage_task_ids
        },
        {
          validateStatus: status => status === 201
        }
      )
      .then(response => {
        let feed_id = response.data.data;
        this.closePost();
        this.$store.dispatch(NOTICE, cb => {
          cb({
            text: '已发送',
            time: 1500,
            status: true
          });
        });
        this.storage_task_ids = [];
        this.uploadList = [];
        this.$refs.upload.fileList = [];
        this.$refs.upload.tempIndex = 1;
        addAccessToken().get(
          createAPI(`feeds/${response.data.data}`),
          {},
          {
            validateStatus: status => status === 200
          }
        )
        .then(({ data: { data = {} } = {} }) => {
          this.$store.dispatch(FEEDSLIST, cb => {
            cb({
              [feed_id]: data
            });
          });
          // 添加本地最新数据
          this.$store.dispatch(ADDNEWIDS, cb => {
            cb([
              feed_id
            ]);
          });
          // 添加本地关注数据
          this.$store.dispatch(ADDFOLLOWINGIDS, cb => {
            cb([
              feed_id
            ]);
          });
        })
      })
    },
    closePost () {
      this.feedTitle = '';
      this.feedContent = '';
      this.isatuser = 0;
      this.storage_task_ids = [];
      this.uploadList = [];
      this.$refs.upload.fileList = [];
      this.$refs.upload.tempIndex = 1;
      this.$store.dispatch(SHOWPOST, cb => {
        cb ({
          show: false
        });
      });
    },
    handleView (index) {
        this.imgName = index;
        this.visible = true;
    },
    handleRemove (index) {
      // 从 upload 实例删除数据
      this.$refs.upload.fileList.splice(index, 1);
      this.storage_task_ids.splice(index, 1);
    },
    handleSuccess (res, file, fileList) {
      if(this.ids[file.name].taskId) {
        noticeTask(this.ids[file.name].taskId, res.message, data => {
          if(data.status || data.code == 0) {
            this.storage_task_ids.push(this.ids[file.name].taskId);
          }
        })
      } else {
        this.$store.dispatch(NOTICE, cb => {
          cb({
            show: true,
            status: false,
            text: '图片' + file.name + '上传出现异常',
            time: 1500
          })
        })
      }
    },
    handleFormatError (name) {
      this.$store.dispatch(NOTICE, cb => {
        cb({
          show: true,
          status: false,
          time: 1500,
          text: '图片' + name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
        })
      })
    },
    handleMaxSize (name) {
      this.$store.dispatch(NOTICE, cb => {
        cb({
          show: true,
          status: false,
          time: 1500,
          text: '图片 ' + name + ' 太大，不能超过 10M。'
        });
      })
    },
    handleMaxItems ( ) {
      this.$store.dispatch(NOTICE, cb => {
        cb({
          show: true,
          status: false,
          time: 1500,
          text: '不能超过9张图片'
        });
      })
    },
    handleBeforeUpload (file) {
      const _file_format = file.name.split('.').pop().toLocaleLowerCase();
      const checked = this.format.some(item => item.toLocaleLowerCase() === _file_format);
      if(!checked) {
        this.handleFormatError(file.name);
        return false;
      }
      if(file.size > this.maxSize * 1024) {
        this.handleMaxSize(file.name);
        return false;
      }
      if(this.uploadList.length > 9) {
        this.handleMaxItems();
        return false;
      }
      return new Promise( (resolve, reject) => {
        this.formateUploadFile(file).then( data => {
          let newFile = {};
          newFile.taskId = data.taskId;
          newFile.url = data.url;
          this.ids = { ...this.ids, [file.name]: newFile };
          newFile = {};
          if(data.status) {
            resolve(file);
          } else {
            return false;
          }
        });
      })
    },
    readFile (file) {
      return new Promise( function (resolve, reject) {
        let reader = new FileReader();
        reader.onload = function () {
          resolve(reader);
        };
        reader.readAsDataURL(file);
      });
    },
    readImg (DataUri) {
      return new Promise( function (resolve, reject) {
        let img = new Image();
        img.src = DataUri.result;
        let info = {};
        info.dataUri = DataUri.result;
        img.onload = function () {
          info.img = img;
          resolve(info);
        };
      });
    },
    uploadFile (fileUpload) {
      return new Promise(function(resolve, reject) {
        createUploadTask(fileUpload, data => {
          if(data.hasOwnProperty('storage_id') && data.hasOwnProperty('storage_task_id')){
            resolve({
              status: 'old',
              data: {
                taskId: data.storage_task_id
              }
            });
          }
          resolve({
            status: 'new',
            data: {
              uploadUri: data.uri,
              headers: data.headers,
              uploadData: data.options,
              taskId: data.storage_task_id
            }
          });
        });
      })
    },
    formateUploadFile (file) {
      return new Promise((resolve, reject) => {
        let fileDataURL = '';
        let fileBinaryString = '';
        let fileUpload = {};
        if(file.type.indexOf('image') !== -1) {
          this.readFile(file).then( dataUri => {
            this.readImg(dataUri).then( info => {
              fileUpload.width = info.img.width;
              fileUpload.height = info.img.height;
              fileUpload.origin_filename = file.name;
              fileUpload.mime_type = info.dataUri.match(reg)[1];
              let fileDecode = Base64.decode(info.dataUri.replace(base64Reg, ''));
              fileUpload.hash = md5(fileDecode);
              this.uploadFile(fileUpload).then( data => {
                if(data.status == 'new') {
                  this.uploadUri = data.data.uploadUri;
                  this.headers = { ...this.headers, ...data.data.headers };
                  this.uploadData = { ...this.uploadData, ...data.data.uploadData };
                  resolve({
                    status: true,
                    taskId: data.data.taskId,
                    url: info.dataUri
                  })
                } else {
                  this.storage_task_ids.push(data.data.taskId);
                  this.uploadList.push({
                    name: file.name,
                    url: info.dataUri,
                    status: 'finished'
                  });
                  resolve({
                    status: false,
                    taskId: 0,
                    url: info.dataUri,
                    percentage: 100
                  });
                }
              });
            });
          })
        } else {
          resolve({
            status: false,
            taskId: 0,
            url: ''
          });
        }
      });
    }
  },
  mounted () {
    this.uploadList = this.$refs.upload.fileList;
  }
};

export default postFeed;
</script>

<style lang="scss" module>
  .postRoot {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0;
    overflow: hidden;
    background: #fff;
    z-index: 10;
    display: block;
    height: 100%;
    width: 100%;
  }
  .uploadList {
    padding: 0 4vw;
    display: flex;
    flex-wrap: wrap;
  }
  .contentInput {
    padding: 6px 0;
    input, textarea {
      border: none;
      padding: 5px 8px;
      transition: none;
      &:focus, &:hover{
        border: none;
        outline: 0;
        box-shadow: none;
      }
    }
  }
  .postFeedNav {
    height: 45px;
    border-bottom: 1px #e2e3e3 solid;
    .navRow {
      height: 100%;
      margin-left: 0!important;
      margin-right: 0!important;
      .actionBtn {
        font-size: 14px;
        display: flex;
        justify-content: flex-start;
        padding: 6px 0;
      }
      .sendAction {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
  .camera {
    width: 22vw;
    height: 22vw; 
    line-height: 22vw;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
<style lang="scss">
  .post-feed {
    .vux-header h1 {
      color: #000;
      height: 44px;
    }
    .weui-cells:after {
      height: 0;
      content: ""!important;
    }
    .weui-cell:before {
      right: 15px;
    }
    .vux-no-group-title {
      margin-top: 0;
    }
    .vux-header .vux-header-left a.vux-header-back{
      color: #59b6d7;
      padding-left: 0;
    }
    .left-arrow {
      display: none;
    }
    .action {
      color: #59b6d7;
      font-size: 14px;
    }
    .notAction {
      color: #999;
      font-size: 14px;
    }
  }
  .demo-upload-list{
    width: 22vw;
    height: 22vw;
    text-align: center;
    line-height: 22vw;
    overflow: hidden;
    background: #fff;
    position: relative;
    margin:.5vw;
  }
  .ivu-upload-drag {
    border-radius: 0;
    border: 1px #e2e2e3 solid;
    &:hover {
      border: 1px #e2e3e3 solid;
    }
  }
  .demo-upload-list img{
      width: 100%;
      height: 100%;
      object-fit: cover;
  }
  .demo-upload-list-cover{
      display: none;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0,0,0,.6);
  }
  .demo-upload-list:hover .demo-upload-list-cover{
      display: block;
  }
  .demo-upload-list-cover i{
      color: #fff;
      font-size: 20px;
      cursor: pointer;
      margin: 0 2px;
  }
</style>
