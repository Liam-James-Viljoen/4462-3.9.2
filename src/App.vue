<template>
  <div id="app">
    <div class="top-overlay-wrapper">
      <div class="overlay-text sticky">Drag here to scroll Up</div>
    </div>
    <DragInteractive/>
    <div class="bottom-overlay-wrapper">
      <div class="overlay-text sticky">Drag here to scroll down</div>
    </div>
  </div>
</template>

<script>
import DragInteractive from './components/drag';
import Stickyfill from 'stickyfilljs';

var elements = document.querySelectorAll(".sticky");
Stickyfill.add(elements);

export default {
  name: "App",
  components: {
    DragInteractive
  },
  data() {
    return {};
  }
};
</script>

<style>
/* Future learn css */ /* This causes second scroll bar to apear when using webkit-dev-server as though it's in a iframe buts needed to allow scrolling when put into an iframe */
html {
height: 100%;
-webkit-overflow-scrolling: touch;
overflow-y: scroll;
}
body {
overflow-y: scroll;
height: 100%;
margin: 0px;
}

/* **************************************************************************************************************************** */
#app {
  font-family: Open Sans,"Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  width: 100%;
  height: 100%;

}

/* Overlay */
.bottom-overlay-wrapper {
  z-index: 1;
  position: -webkit-sticky;
  position: sticky;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 30px;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
}
.top-overlay-wrapper {
  z-index: 1;
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  right: 0;
  width: 100%;
  height: 30px;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
}
.overlay-text {
  color: white;
  width: 100%;
  font-size: 20px;
}
</style>
