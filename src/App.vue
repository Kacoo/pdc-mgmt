<template>
  <div id="app">
    <form-fill></form-fill>
  </div>
</template>

<script>
import FormFill from './components/FormFill.vue'

export default {
  name: 'app',
  components: {
    FormFill
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
