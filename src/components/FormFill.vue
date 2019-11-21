<template>
  <van-cell-group>
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

    <!-- 图片上传 -->
    <van-uploader
      v-model="fileList"
      multiple
      :max-count="15"
      preview-size="40px"
      :after-read="afterRead"
    />
    <van-button type="primary" @click="completeUpload">点击上传图片</van-button>
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
  Uploader
} from "vant";

Vue.use(CellGroup)
  .use(Field)
  .use(DatetimePicker)
  .use(Popup)
  .use(Picker)
  .use(Button)
  .use(Uploader);

export default {
  name: "FormFill",
  data() {
    return {
      instanceName: "",
      showInstance: false,
      showTimePicker: false,
      showTimePicker1: false,
      instanceArr: ["切西瓜", "切冬瓜", "切南瓜", "切橙子"],
      statisticalTime: this.formatter(new Date()),
      statisticalPeriod: `${this.formatterMinus5(new Date())}至${this.formatter(
        new Date()
      )}`,
      minDate: new Date(2019, 9, 24),
      fileList: [],
      phoneType: {
        onePlus7: {
          scaleX: 0.67,
          scaleY: 0.15,
          scaleWidth: 0.33,
          scaleHeight: 0.78
        },
        iphone8: {
          scaleX: 0.6,
          scaleY: 0.14,
          scaleWidth: 0.4,
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
      // 图片上传完毕，点击按钮，开始切图
      let imageList = []; // 该数组用于存放最终切完的图
      this.fileList.map((item, index, arr) => {
        var imgObject = new Image();
        imgObject.onload = () => {
          var newImg = getImagePortion(imgObject, this.phoneType.iphone8);
          //place image in appropriate div，这一步可以不用
          document.getElementById("images").innerHTML =
            "<img alt='' src='" + newImg + "' />";
          // console.log("newImg: " + newImg);
          imageList.push(newImg);
          if (imageList.length === arr.length) {
            let newImgList = imageList.map(item => item.split(",")[1]);
            // sad似乎只能一张张图片上传，上传两张会报错"request entity too large"
            let fd = {image: newImgList };
            let config = {
              headers: {
                "Content-Type": "application/json;charset=utf-8"
                // "Content-Type": "application/x-www-form-urlencoded"
              }
            };
            axios
              .post("http://localhost:3000/images", qs.parse(qs.stringify(fd)), config)
              .then(res => console.log(res))
              .catch(err => console.log(err));
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