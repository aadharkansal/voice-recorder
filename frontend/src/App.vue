<template>
  <div id="app">
    <HomePage />
    <RecordingPage />
  </div>
</template>

<script>
import HomePage from './components/HomePage.vue';
import RecordingPage from './components/RecordingPage.vue';

export default {
  components: {
    HomePage,
    RecordingPage,
  },
};
</script>
