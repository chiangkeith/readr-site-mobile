<template>
  <section class="followingListInTab">
    <nav class="followingListInTab__nav">
      <button
        :class="[ currentResource === 'member' ? 'active' : '' ]"
        @click="$_followingListInTab_resourceHandler('member')"
        v-text="$t('follow.WORDING_FOLLOW_LIST_GUEST_EDITOR')">
      </button>
      <button
        :class="[ currentResource === 'review' ? 'active' : '' ]"
        @click="$_followingListInTab_resourceHandler('review')"
        v-text="`${$t('follow.WORDING_FOLLOW_LIST_FOLLOW')}${$t('follow.WORDING_FOLLOW_LIST_REVIEW')}`">
      </button>
      <button
        :class="[ currentResource === 'news' ? 'active' : '' ]"
        @click="$_followingListInTab_resourceHandler('news')"
        v-text="`${$t('follow.WORDING_FOLLOW_LIST_FOLLOW')}${$t('follow.WORDING_FOLLOW_LIST_NEWS')}`">
      </button>
      <button
        :class="[ currentResource === 'project' ? 'active' : '' ]"
        @click="$_followingListInTab_resourceHandler('project')"
        v-text="`${$t('follow.WORDING_FOLLOW_LIST_FOLLOW')}${$t('follow.WORDING_FOLLOW_LIST_PROJECT')}`">
      </button>
    </nav>
    <!-- <pagination-nav></pagination-nav> -->
    <div class="followingListInTab__list">
      <div v-for="follow in followingByUser" :key="follow.id" class="followingListInTab__item" :class="currentResource">
        <div v-if="currentResource === 'member'" class="followingListInTab__img">
          <div :style="{ backgroundImage: `url(${follow.profileImage})` }"></div>
        </div>
        <div class="followingListInTab__content" :class="currentResource">
          <h2 v-if="currentResource === 'member'" v-text="follow.nickname"></h2>
          <h2 v-if="currentResource !== 'member'" v-text="follow.title"></h2>
          <button @click="$_followingListInTab_unfollow(follow.id)"><img src="/public/icons/star-grey.png"></button>
          <p v-if="$_followingListInTab_getDescription(follow)" v-text="$_followingListInTab_getDescription(follow)"></p>
        </div>
        <div v-if="currentResource === 'project'" class="followingListInTab__og"></div>
      </div>
    </div>
  </section>
</template>
<script>
  import _ from 'lodash'
  import PaginationNav from './PaginationNav.vue'

  export default {
    name: 'FollowingListInTab',
    components: {
      'pagination-nav': PaginationNav,
    },
    props: {
      currentResource: {
        type: String,
        required: true,
      },
      followingByUser: {
        type: Array,
        required: true,
      },
    },
    methods: {
      $_followingListInTab_getDescription (follow) {
        switch (this.currentResource) {
          case 'member': {
            return _.get(follow, [ 'description', ])
          }
          case 'post': {
            const parser = new DOMParser()
            const html = parser.parseFromString(follow.content, 'text/html')
            const origin = Array.from(html.querySelectorAll('p'))
              .filter((node) => {
                return node.innerHTML !== '<br>'
              })
              .map((node) => {
                return node.innerHTML.replace(/<[^>]*>/g, "")
              })
              .join('')
            return origin
          }
          default:
            return ''
        }
      },
      $_followingListInTab_resourceHandler (resource) {
        this.$emit('changeResource', resource)
      },
      $_followingListInTab_unfollow (id) {
        this.$emit('unfollow', this.currentResource, id)
      },
    },
  }
</script>
<style lang="stylus" scoped>

.followingListInTab
  width 100%
  margin 0 auto
  &__nav
    button
      height 15px
      padding 0
      margin 0 5px
      color #a8a8a8
      font-size .85rem
      background transparent
      border none
      outline none
      &.active
        color #000
        &::before
          content ''
          width 0
          height 0
          margin-right 3px
          font-size 0
          line-height 0
          vertical-align super
          border-style solid
          border-width 7.5px 0 7.5px 15px
          border-color transparent transparent transparent #ddcf21
  &__list
    margin-top 25px
  &__item
    display flex
    align-items flex-start
    margin-bottom 25px
    &:last-of-type
      margin-bottom 0
    &.review
      .followingListInTab__img
        width 25px
        height 25px
        text-align left
      .followingListInTab__content
        h2
          height 25px
          line-height 25px
  &__img
      width 45px
      text-align center
      > div
        width 45px
        height 45px
        background-position center
        background-size cover
        background-repeat no-repeat
        border 1px solid #979797
        border-radius 50%
      
  &__content
    flex 1
    &.member
      margin-left 10px
    h2
      display inline-block
      margin 0
      font-size .9375rem
      line-height 20px
    p
      margin-top 2px
      margin-bottom 0
      font-size .875rem
      text-align justify
      line-height 1.4
    button
      width 20px
      height 20px
      padding 0
      margin-left 10px
      text-align center
      vertical-align sub
      background transparent
      border none
      outline none
      img 
        width 100%
  &__og
    width 175px
    height 92px
    margin-left 15px

</style>
