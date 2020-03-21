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

    <!-- 统计周期 -->
    <van-field
      v-model="statisticalPeriod"
      readonly
      required
      clickable
      clearable
      label="统计周期"
      placeholder="请选择周期"
      @click="showTimePicker = true"
    />
    <van-popup v-model="showTimePicker" position="bottom" :style="{ height: '30%' }">
      <van-datetime-picker
        type="date"
        title="请选择统计开始日期"
        :min-date="minDate"
        @cancel="showTimePicker = false"
        @confirm="onStatisticalPeriodConfirm"
      />
    </van-popup>

    <van-button type="primary" @click="query" block>查询</van-button>
    <div v-if="instanceDetail.length">
      <h5>当当当~下面是查询结果：</h5>
      <table border="1">
        <tr>
          <th>人员</th>
          <th>副本成绩</th>
        </tr>
        <tr v-for="(item, index) in instanceDetail" v-bind:key="index">
          <td>{{item['player_name'] + '\t'}}</td>
          <td>{{item['score'] || '-' + '\n'}}</td>
        </tr>
      </table>
    </div>
  </van-cell-group>
</template>

<script>
import Vue from "vue";
import "vant/lib/index.css";
import axios from "axios";
import {
  CellGroup,
  Field,
  DatetimePicker,
  Popup,
  Picker,
  Button,
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
  .use(Overlay)
  .use(Toast);

axios.defaults.baseURL = `http://${myConfig.host}:${myConfig.port}`;

export default {
  name: "Query",
  data() {
    return {
      // instanceName: "全部",
      instanceName: instance[3].name,
      instanceArr: instance.map(item => item.name),
      showInstance: false,
      showTimePicker: false,
      statisticalPeriod: `${this.formatterMinus5(new Date())}至${this.formatter(
        new Date()
      )}`,
      minDate: new Date(2020, 2, 15),
      instanceDetail: [],
      over: false
    };
  },
  methods: {
    query() {
      // 清空查询结果
      this.instanceDetail = [];
      // 开启遮罩，防止一直点击
      this.over = true;
      let params = {
        instanceName: this.instanceName,
        instanceId: instance.filter(item => item.name === this.instanceName)[0]
          .id,
        startTime: this.statisticalPeriod.split("至")[0],
        endTime: this.statisticalPeriod.split("至")[1]
      };
      console.log(params);
      axios
        .get("/query", { params: params })
        .then(res => {
          this.over = false;
          console.log(res);
          if (res.data.status === "true" && res.data.data.length) {
            this.instanceDetail = res.data.data;
          } else if (!res.data.data.length) {
            Toast.fail("查不到数据喔");
          } else {
            Toast.fail("不知道哪里错了，检查一下有没有填错8");
          }
        })
        .catch(err => {
          this.over = false;
          console.log(err);
          Toast.fail("不知道哪里错了，检查一下副本和周期有没有填错8");
          // Toast.fail(err);
        });
    },
    onInstanceConfirm(value) {
      this.instanceName = value;
      this.showInstance = false;
    },
    onStatisticalPeriodConfirm(date) {
      this.statisticalPeriod = `${this.formatter(date)}至${this.formatterPlus5(
        date
      )}`;
      this.showTimePicker = false;
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
    }
  }
};
</script>

<style>
</style>