<template>
  <svg viewBox="0 0 24 24" :height="height" :width="width" :fill="color" style="display: inherit;">
    <g>
      <path class="st0" d="M19.2,20l-1,0.2l0.1,0.6c0,0.2-0.1,0.4-0.2,0.5c-0.1,0.1-0.2,0.1-0.4,0.1c-0.1,0-0.2,0-0.3-0.1l-5-2.6
    c-0.1-0.1-0.3-0.1-0.5-0.1c-0.2,0-0.3,0-0.5,0.1l-5,2.6c-0.1,0-0.2,0.1-0.3,0.1c-0.1,0-0.2,0-0.3-0.1c-0.2-0.1-0.3-0.3-0.2-0.5
    l1-5.7c0.1-0.3-0.1-0.6-0.3-0.9l-4.2-4.1C2,10,2,9.8,2,9.7c0.1-0.2,0.3-0.3,0.5-0.4l5.7-0.8c0.3,0,0.6-0.3,0.8-0.5l2.5-5.1
    c0.1-0.2,0.3-0.3,0.5-0.3c0.2,0,0.4,0.1,0.5,0.3L15,7.9c0.1,0.3,0.4,0.5,0.8,0.5l5.7,0.8c0.2,0,0.4,0.2,0.5,0.4
    c0.1,0.2,0,0.4-0.1,0.5l-4.2,4.1c-0.2,0.2-0.3,0.5-0.3,0.9l0.2,1.3l1-0.2L18.4,15l4.2-4.1c0.4-0.4,0.6-1,0.4-1.5
    c-0.2-0.5-0.7-0.9-1.3-1l-5.7-0.8l-2.5-5.1c-0.3-0.5-0.8-0.9-1.4-0.9c-0.6,0-1.2,0.3-1.4,0.9L8.1,7.5L2.3,8.3
    c-0.6,0.1-1.1,0.5-1.3,1c-0.2,0.5,0,1.1,0.4,1.5L5.6,15l-1,5.7c-0.1,0.6,0.2,1.1,0.7,1.5c0.3,0.2,0.6,0.3,0.9,0.3
    c0.3,0,0.5-0.1,0.8-0.2l5-2.6l5,2.6c0.2,0.1,0.5,0.2,0.8,0.2c0.3,0,0.6-0.1,0.9-0.3c0.5-0.3,0.8-0.9,0.7-1.5L19.2,20z"/>
    <circle class="st0" cx="18.7" cy="20.1" r="0.5"/>
    <circle class="st0" cx="18.1" cy="16.3" r="0.5"/>
    </g>
  </svg>
</template>
<script>
const Connection = {
  props: {
    height: {
      type: [String, Number],
      default: 24
    },
    width: {
      type: [String, Number],
      default: 24
    },
    color: {
      type: String,
      default: '#000'
    }
  }
}

export default Connection;
</script>