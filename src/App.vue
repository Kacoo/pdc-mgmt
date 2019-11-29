<template>
  <div id="app">
    <van-tabs color="#07c160">
      <van-tab title="副本上传">
        <Form-Fill></Form-Fill>
      </van-tab>
      <van-tab title="副本查询">
        <Query></Query>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import Vue from "vue";
import { Tab, Tabs } from "vant";
import FormFill from './components/FormFill'
import Query from './components/Query'

Vue.use(Tab).use(Tabs);

export default {
  name: "app",
  components: {
    FormFill,
    Query
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* margin-top: 60px; */
}
</style>
