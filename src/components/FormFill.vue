<template>
  <van-cell-group>
    <van-overlay :show="over" />
    <!-- 副本名称 -->
    <van-field
      v-model="instanceName"
      readonly
      required
      clickable
      clearable
      label="副本名称"
      placeholder="请选择副本类型"
      @click="showInstance = true"
    />
    <van-popup v-model="showInstance" position="bottom" :style="{ height: '30%' }">
      <van-picker
        show-toolbar
        :columns="instanceArr"
        @cancel="showInstance = false"
        @confirm="onInstanceConfirm"
        title="请选择副本类型"
      />
    </van-popup>

    <!-- 统计时间 -->
    <van-field
      v-model="statisticalTime"
      readonly
      required
      clickable
      clearable
      label="统计时间"
      placeholder="请选择统计时间"
      @click="showTimePicker = true"
    />
    <van-popup v-model="showTimePicker" position="bottom" :style="{ height: '30%' }">
      <van-datetime-picker
        type="date"
        @cancel="showTimePicker = false"
        @confirm="onStatisticalTimeConfirm"
      />
    </van-popup>

    <!-- 统计周期 -->
    <van-field
      v-model="statisticalPeriod"
      readonly
      required
      clickable
      clearable
      label="统计周期"
      placeholder="请选择周期"
      @click="showTimePicker1 = true"
    />
    <van-popup v-model="showTimePicker1" position="bottom" :style="{ height: '30%' }">
      <van-datetime-picker
        type="date"
        title="请选择统计开始日期"
        :min-date="minDate"
        @cancel="showTimePicker1 = false"
        @confirm="onStatisticalPeriodConfirm"
      />
    </van-popup>

    <!-- 手机型号 -->
    <van-field
      v-model="phoneType"
      readonly
      required
      clickable
      clearable
      label="截图手机"
      placeholder="请选择手机型号"
      @click="showPhoneTypeList = true"
    />
    <van-popup v-model="showPhoneTypeList" position="bottom" :style="{ height: '30%' }">
      <van-picker
        show-toolbar
        :columns="Object.keys(phoneTypeList)"
        @cancel="showPhoneTypeList = false"
        @confirm="onPhoneTypeConfirm"
        title="请选择手机型号"
      />
    </van-popup>

    <!-- 图片上传 -->
    <van-uploader
      v-model="fileList"
      multiple
      :max-count="10"
      preview-size="40px"
      :after-read="afterRead"
    />
    <van-button type="primary" @click="completeUpload" block>点击上传图片</van-button>
    <img id="images" src alt />
  </van-cell-group>
</template>

<script>
import Vue from "vue";
import "vant/lib/index.css";
import axios from "axios";
import qs from "querystring";
import {
  CellGroup,
  Field,
  DatetimePicker,
  Popup,
  Picker,
  Button,
  Uploader,
  Overlay,
  Toast
} from "vant";
// 自己写的模块
import instance from "../common/common";
import myConfig from "../common/config";

Vue.use(CellGroup)
  .use(Field)
  .use(DatetimePicker)
  .use(Popup)
  .use(Picker)
  .use(Button)
  .use(Uploader)
  .use(Overlay)
  .use(Toast);

export default {
  name: "FormFill",
  data() {
    return {
      instanceName: instance[0].name,
      over: false,
      showInstance: false,
      showTimePicker: false,
      showTimePicker1: false,
      showPhoneTypeList: false,
      instanceArr: instance.map(item => item.name),
      statisticalTime: this.formatter(new Date()),
      statisticalPeriod: `${this.formatterMinus5(new Date())}至${this.formatter(
        new Date()
      )}`,
      minDate: new Date(2019, 9, 24),
      fileList: [],
      phoneType: "iphone8_6sp",
      phoneTypeList: {
        iphone8_6sp: {
          scaleX: 0.6,
          scaleY: 0.14,
          scaleWidth: 0.4,
          scaleHeight: 0.78
        },
        onePlus7Pro: {
          scaleX: 0.67,
          scaleY: 0.15,
          scaleWidth: 0.33,
          scaleHeight: 0.78
        }
      }
    };
  },
  methods: {
    onInstanceConfirm(value) {
      this.instanceName = value;
      this.showInstance = false;
    },
    onStatisticalTimeConfirm(date) {
      this.statisticalTime = this.formatter(date);
      this.showTimePicker = false;
    },
    onStatisticalPeriodConfirm(date) {
      this.statisticalPeriod = `${this.formatter(date)}至${this.formatterPlus5(
        date
      )}`;
      this.showTimePicker1 = false;
    },
    onPhoneTypeConfirm(value) {
      this.phoneType = value;
      this.showPhoneTypeList = false;
    },
    formatter(date) {
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    },
    formatterPlus5(datePlus5) {
      return `${datePlus5.getFullYear()}-${datePlus5.getMonth() +
        1}-${datePlus5.getDate() + 5}`;
    },
    formatterMinus5(dateMinus5) {
      return `${dateMinus5.getFullYear()}-${dateMinus5.getMonth() +
        1}-${dateMinus5.getDate() - 5}`;
    },
    afterRead() {
      console.log(this.fileList);
    },
    completeUpload() {
      this.over = true;
      // 图片上传完毕，点击按钮，开始切图
      let imageList = []; // 该数组用于存放最终切完的图
      this.fileList.map((item, index, arr) => {
        var imgObject = new Image();
        imgObject.onload = () => {
          var newImg = getImagePortion(
            imgObject,
            this.phoneTypeList[this.phoneType]
          );
          //place image in appropriate div，这一步可以不用
          // document.getElementById("images").innerHTML =
          //   "<img alt='' src='" + newImg + "' />";

          imageList.push(newImg);

          // 如果图片全部切完，就发请求8!
          if (imageList.length === arr.length) {
            let newImgList = imageList.map(item => item.split(",")[1]);
            // sad似乎只能一张张图片上传，上传两张会报错"request entity too large"
            let postData = {
              image: newImgList,
              instanceId: instance.filter(
                item => item.name === this.instanceName
              )[0].id,
              instanceName: this.instanceName,
              statisticalTime: this.statisticalTime,
              statisticalPeriod: this.statisticalPeriod,
              phoneType: this.phoneType
            };
            let config = {
              headers: {
                "Content-Type": "application/json;charset=utf-8"
              }
            };
            axios
              .post(
                `http://${myConfig.host}:${myConfig.port}/images`,
                qs.parse(qs.stringify(postData)),
                config
              )
              .then(res => {
                this.over = false;
                console.log(res);
                if (res.data.status === "true") {
                  Toast.success("提交成功");
                } else if (res.data.msg) {
                  Toast.fail(res.data.msg);
                } else {
                  Toast.fail("不知道哪里错了，重新提交试试");
                }
              })
              .catch(err => {
                this.over = false;
                Toast.fail("检查一下服务器是不是挂啦");
                console.log(err);
              });
          }
        };
        imgObject.src = item.content;
      });
      console.log(imageList);

      // 将图片切成需要的大小
      function getImagePortion(imgObj, scale) {
        // 定义截图开始坐标，以及截图长度
        var startX = imgObj.width * scale.scaleX;
        var startY = imgObj.height * scale.scaleY;
        var newWidth = imgObj.width * scale.scaleWidth;
        var newHeight = imgObj.height * scale.scaleHeight;

        // 搞个画布
        var tnCanvas = document.createElement("canvas");
        var tnCanvasContext = tnCanvas.getContext("2d");
        tnCanvas.width = newWidth;
        tnCanvas.height = newHeight;
        /* use the sourceCanvas to duplicate the entire image. This step was crucial for iOS4 and under devices. Follow the link at the end of this post to see what happens when you don’t do this */
        var bufferCanvas = document.createElement("canvas");
        var bufferContext = bufferCanvas.getContext("2d");
        bufferCanvas.width = imgObj.width;
        bufferCanvas.height = imgObj.height;
        bufferContext.drawImage(imgObj, 0, 0);
        /* now we use the drawImage method to take the pixels from our bufferCanvas and draw them into our thumbnail canvas */
        tnCanvasContext.drawImage(
          bufferCanvas,
          startX,
          startY,
          newWidth,
          newHeight,
          0,
          0,
          newWidth,
          newHeight
        );
        // 将结果转为base64编码返回
        return tnCanvas.toDataURL();
      }
    }
  }
};
</script>

<style>
</style>