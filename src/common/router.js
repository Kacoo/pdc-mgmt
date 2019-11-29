// 由于使用了tab页，所以router就不再使用了
import Vue from "vue";
import VueRouter from "vue-router";
import FormFill from '../components/FormFill'
import Query from '../components/Query'


Vue.use(VueRouter);

const routes = [
  { name: 'form', path: '/form', component: FormFill },
  { name: 'query', path: '/query', component: Query }
]

const router = new VueRouter({
  routes // (缩写) 相当于 routes: routes
})

export default router