<template>
  <section class="controlBar">
    <control-bar-button-box
      v-if="$can('addPost')"
      class="controlBar__btnBox"
      :amount="3"
      :style="[ viewport <= 767 ? { width: `calc((100% - (${(amountBtn - 1) * 5}px))/ ${amountBtn})` } : {} ]"
      @changeBtnAmount="$_controlBar_btnAmountHandler">
      <button slot="0" class="controlBar--btn edit" @click="$_controlBar_toggleBtnBox" v-text="wordingBtnReview"></button>
      <button slot="1" class="controlBar--subBtn" @click="$_controlBar_clickHandler('addReview')" v-text="$t('control_bar.WORDING_CONTROLBAR_ADD_DIRECTLY')"></button>
      <button slot="2" class="controlBar--subBtn" @click="$_controlBar_clickHandler('editReview')" v-text="$t('control_bar.WORDING_CONTROLBAR_EDIT_DRAFT')"></button>
    </control-bar-button-box>
    <control-bar-button-box
      v-if="$can('addPost')"
      class="controlBar__btnBox"
      :amount="3"
      :style="[ viewport <= 767 ? { width: `calc((100% - (${(amountBtn - 1) * 5}px))/ ${amountBtn})` } : {} ]"
      @changeBtnAmount="$_controlBar_btnAmountHandler">
      <button slot="0" class="controlBar--btn edit" @click="$_controlBar_toggleBtnBox" v-text="wordingBtnNews"></button>
      <button slot="1" class="controlBar--subBtn" @click="$_controlBar_clickHandler('addNews')" v-text="$t('control_bar.WORDING_CONTROLBAR_ADD_DIRECTLY')"></button>
      <button slot="2" class="controlBar--subBtn" @click="$_controlBar_clickHandler('editNews')" v-text="$t('control_bar.WORDING_CONTROLBAR_EDIT_DRAFT')"></button>
    </control-bar-button-box>
    <control-bar-button-box
      v-if="viewport <= 767"
      class="controlBar__btnBox"
      :amount="5"
      :style="[ viewport <= 767 ? { width: `calc((100% - (${(amountBtn - 1) * 5}px))/ ${amountBtn})` } : {} ]"
      @changeBtnAmount="$_controlBar_btnAmountHandler">
      <button slot="0" class="controlBar--btn" @click="$_controlBar_toggleBtnBox" v-text="$t('control_bar.WORDING_CONTROLBAR_MANAGE')"></button>
      <button slot="1" class="controlBar--subBtn" :class="[ activePanel === 'record' ? 'active' : '' ]" v-text="$t('control_bar.WORDING_CONTROLBAR_RECORD')" @click="$_controlBar_openPanel($event, 'records')"></button>
      <button slot="2" class="controlBar--subBtn" :class="[ activePanel === 'posts' ? 'active' : '' ]" v-text="$t('control_bar.WORDING_CONTROLBAR_POST')" @click="$_controlBar_openPanel($event, 'posts')"></button>
      <!-- <button slot="3" class="controlBar--subBtn" :class="[ activePanel === 'video' ? 'active' : '' ]" v-text="$t('control_bar.WORDING_CONTROLBAR_VIDEO')" @click="$_controlBar_openPanel($event, 'videos')"></button> -->
      <button slot="4" class="controlBar--subBtn" :class="[ activePanel === 'tag' ? 'active' : '' ]" v-text="$t('control_bar.WORDING_CONTROLBAR_TAG')" @click="$_controlBar_openPanel($event, 'tags')"></button>
    </control-bar-button-box>
    <control-bar-button-box
      v-if="$can('addAccount') && $can('memberManage') && viewport <= 767"
      class="controlBar__btnBox"
      :amount="3"
      :style="[ viewport <= 767 ? { width: `calc((100% - (${(amountBtn - 1) * 5}px))/ ${amountBtn})` } : {} ]"
      @changeBtnAmount="$_controlBar_btnAmountHandler">
      <button slot="0" class="controlBar--btn" @click="$_controlBar_toggleBtnBox" v-text="$t('control_bar.WORDING_CONTROLBAR_ACCOUNT')"></button>
      <button slot="1" class="controlBar--subBtn" v-text="$t('control_bar.WORDING_CONTROLBAR_ADD_DIRECTLY')" @click="$_controlBar_clickHandler('addAccount')"></button>
      <button slot="2" class="controlBar--subBtn" v-text="$t('control_bar.WORDING_CONTROLBAR_ACCOUNT_LIST')" @click="$_controlBar_openPanel($event, 'accounts')"></button>
    </control-bar-button-box>
    <control-bar-button
      v-if="viewport > 767"
      class="controlBar--btn"
      @changeBtnAmount="$_controlBar_btnAmountHandler"
      @click="$_controlBar_openPanel($event, 'records')"
      :text="`${$t('control_bar.WORDING_CONTROLBAR_RECORD')}${$t('control_bar.WORDING_CONTROLBAR_MANAGE')}`">
    </control-bar-button>
    <control-bar-button
      v-if="$can('editOtherPost') && viewport > 767"
      class="controlBar--btn"
      @changeBtnAmount="$_controlBar_btnAmountHandler"
      @click="$_controlBar_openPanel($event, 'posts')"
      :text="`${$t('control_bar.WORDING_CONTROLBAR_POST')}${$t('control_bar.WORDING_CONTROLBAR_MANAGE')}`">
    </control-bar-button>
    <control-bar-button
      v-if="$can('editTag') && viewport > 767"
      class="controlBar--btn"
      @changeBtnAmount="$_controlBar_btnAmountHandler"
      @click="$_controlBar_openPanel($event, 'tags')"
      :text="`${$t('control_bar.WORDING_CONTROLBAR_TAG')}${$t('control_bar.WORDING_CONTROLBAR_MANAGE')}`">
    </control-bar-button>
    <!-- <control-bar-button-box
      v-if="viewport > 767"
      class="controlBar__btnBox"
      :amount="2">
      <button slot="0" class="controlBar--btn" @click="$_controlBar_openPanel($event, 'videos')" v-text="`${$t('control_bar.WORDING_CONTROLBAR_VIDEO')}${$t('control_bar.WORDING_CONTROLBAR_MANAGE')}`"></button>
      <button slot="1" class="controlBar--subBtn" v-text="$t('control_bar.WORDING_CONTROLBAR_ADD_VIDEO')" @click="$_controlBar_clickHandler('addVideo')"></button>
    </control-bar-button-box> -->
    <control-bar-button
      v-if="$can('addAccount') && viewport > 767"
      class="controlBar--btn"
      @changeBtnAmount="$_controlBar_btnAmountHandler"
      @click="$_controlBar_clickHandler('addAccount')"
      :text="$t('control_bar.WORDING_CONTROLBAR_ADD_ACCOUNT')">
    </control-bar-button>
    <control-bar-button
      v-if="$can('memberManage') && viewport > 767"
      class="controlBar--btn"
      @changeBtnAmount="$_controlBar_btnAmountHandler"
      @click="$_controlBar_openPanel($event, 'accounts')"
      :text="`${$t('control_bar.WORDING_CONTROLBAR_ACCOUNT')}${$t('control_bar.WORDING_CONTROLBAR_MANAGE')}`">
    </control-bar-button>
  </section>
</template>
<script>
  import { includes, } from 'lodash'
  import ControlBarButton from './ControlBarButton.vue'
  import ControlBarButtonBox from './ControlBarButtonBox.vue'

  export default {
    name: 'TheControlBar',
    components: {
      'control-bar-button': ControlBarButton,
      'control-bar-button-box': ControlBarButtonBox,
    },
    data () {
      return {
        activePanel: 'record',
        amountBtn: 0,
        viewport: 0,
      }
    },
    computed: {
      wordingBtnNews () {
        return this.viewport <= 767 ? this.$t('control_bar.WORDING_CONTROLBAR_NEWS') : this.$t('control_bar.WORDING_CONTROLBAR_ADD_NEWS')
      },
      wordingBtnReview () {
        return this.viewport <= 767 ? this.$t('control_bar.WORDING_CONTROLBAR_REVIEW') : this.$t('control_bar.WORDING_CONTROLBAR_ADD_REVIEW')
      },
    },
    mounted () {
      this.$_controlBar_getViewport()
      window.addEventListener('resize', this.$_controlBar_getViewport)
    },
    destroyed () {
      window.removeEventListener('resize', this.$_controlBar_getViewport)
    },
    methods: {
      $_controlBar_btnAmountHandler (isMounted) {
        if (isMounted) {
          this.amountBtn += 1
        } else {
          this.amountBtn -= 1
        }
      },
      $_controlBar_clickHandler (eventName) {
        this.$emit(eventName)
      },
      $_controlBar_getViewport () {
        this.viewport = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
      },
      $_controlBar_openPanel (event, panel) {
        this.activePanel = panel
        this.$emit('openPanel', panel)
        if (this.viewport < 950) {
          event.target.parentNode.classList.remove('active')
        }
      },
      $_controlBar_toggleBtnBox (e) {
        if (this.viewport < 950 && includes(e.target.parentNode.classList, 'active')) {
          e.target.parentNode.classList.remove('active')
        } else {
          e.target.parentNode.classList.add('active')
        }
      },
    },
  }
</script>
<style lang="stylus" scoped>
.controlBar
  display flex
  padding 0 20px

  button
    outline none

  &__btnBox
    display flex
    position relative
    width 90px
    margin-right 5px
    cursor pointer
    transition width .5s ease-in-out
    &:last-of-type
      margin 0
    > button:first-of-type
      z-index 10
    .controlBar--btn
      width 100%
      margin 0
    .controlBar--subBtn
      width calc(100% - 2px)

  &--btn
    width 90px
    height 30px
    padding 0
    margin-right 5px
    color #808080
    font-size 15px
    background-color #fff
    border 1px solid #d3d3d3
    cursor pointer
    transition all .5s ease-in-out
    &:first-of-type
      margin-left 0
  
  &--subBtn
    box-sizing content-box
    position absolute
    top 0
    left 0
    z-index -1
    width 88px
    height 30px
    padding 0
    color #808080
    font-size 12px
    background-color #fff
    border 1px solid #d3d3d3
    cursor pointer
    transition-timing-function ease-in-out
    transition-duration .3s
    &:nth-of-type(2)
      border-top none

@media (max-width 949px)
  .controlBar
    &__btnBox
      &.active
        > button
          &:nth-of-type(2)
            transform translate3d(0, 30px, 0)
          &:nth-of-type(3)
            transform translate3d(0, 60px, 0)
          &:nth-of-type(4)
            transform translate3d(0, 90px, 0)
          &:nth-of-type(5)
            transform translate3d(0, 120px, 0)
        .controlBar--btn.edit
          color #fff 
          background-color #808080 
        .controlBar--subBtn
          z-index 10
    &--subBtn
      &.active
        color #fff
        background-color #808080


@media (min-width 950px)
  .controlBar
    &__btnBox
      width 100px
      &:hover
        .controlBar--btn
          color #fff
          background-color #808080
        .controlBar--subBtn
          z-index auto
          transition-timing-function ease-in-out
        > button
          &:nth-of-type(2)
            transform translate3d(0, 30px, 0)
          &:nth-of-type(3)
            transform translate3d(0, 60px, 0)
          &:nth-of-type(4)
            transform translate3d(0, 90px, 0)
    &--btn
      width 100px
      font-size 18px
    &--subBtn
      width 98px
      font-size 18px
      
</style>
