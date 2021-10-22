<template>
  <div id="app">
    <tiptap />
  </div>
</template>

<script>
import Tiptap from './components/Tiptap.vue'

export default {
  name: 'App',
  components: {
    Tiptap
  }
}
</script>

<style lang="scss">
#app {
  display: flex;
  justify-content: center;
  margin-top: 10vh;
  height: 100vh;
  width: 100vw;

  .tiptap {
    max-width: 34vw;
  }
}
</style>