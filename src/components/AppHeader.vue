<template>
  <div class="header">
    <img class="header__logo" src="/public/icons/logo-mobile.png" alt="">
    
    <SearchTool class="header__item"></SearchTool>
    <div class="header__item header--hamburger" @click="toggleMenu">
      <div class="header__hamburgerBar"></div>
      <div class="header__hamburgerBar"></div>
      <div class="header__hamburgerBar"></div>
    </div>
    <div v-if="isClientSide && isLoggedIn" class="header__item header--account" @click="goMemberCenter">
      <p v-text="userNickname"></p>
      <img src="/public/icons/account.png" alt="">
    </div>
    <div v-if="isClientSide" class="header__item header--status" >
      <a v-if="!isLoggedIn" class="header__status-item" href="/login" v-text="$t('header.WORDING_HEADER_LOGIN')"></a>
      <div v-else-if="isLoggedIn" class="header__status-item" @click="logout" v-text="$t('header.WORDING_HEADER_LOGOUT')"></div>
    </div>

    <section ref="headerMenu" class="header__menu">
      <ul>
        <li><a><img src="/public/icons/fb.png" alt=""></a></li>
        <li><a><img src="/public/icons/github.png" alt=""></a></li>
        <li><a><img src="/public/icons/info.png" alt=""></a></li>
        <li><a><img src="/public/icons/mirrormedia.png" alt=""></a></li>
      </ul>
      <div class="header__menu-curtain" @click="toggleMenu"></div>
    </section>
  </div>
</template>
<script>
  import _ from 'lodash'
  import { ROLE_MAP, } from '../constants'
  import { removeToken, } from '../util/services'
  import SearchTool from 'src/components/search/SearchTool.vue'

  const checkLoginStatus = (store) => {
    return store.dispatch('CHECK_LOGIN_STATUS', {})
  }
  const getProfile = (store) => {
    return store.dispatch('GET_PROFILE', {})
  }
  const logout = (store) => {
    return store.dispatch('LOGOUT', {})
  }

  export default {
    components: {
      SearchTool,
    },
    computed: {
      currUrl () {
        return _.get(this.$router, [ 'fullpath', ])
      },
      currentUser () {
        return _.get(this.$store, [ 'state', 'profile', ], {})
      },
      isLoggedIn () {
        return _.get(this.$store, [ 'state', 'isLoggedIn', ])
      },
      userNickname () {
        return this.isLoggedIn && _.get(this.currentUser, [ 'nickname', ], _.get(this.currentUser, [ 'name', ], this.$t('header.WORIDNG_HEADER_MEMBER_CENTRE')))
      },
    },
    data () {
      return {
        isClientSide: false,
      }
    },
    name: 'AppHeader',
    methods: {
      goMemberCenter () {
        const memberCenter = _.get(_.filter(ROLE_MAP, { key: _.get(this.$store, [ 'state', 'profile', 'role', ]), }), [ 0, 'route', ], 'member')
        /**
         * use location.replace instead of router.push to server-side render page
         */
        location && location.replace(`/${memberCenter}`)
      },
      logout () {
        logout(this.$store).then(() => {
          return removeToken().then(() => {
            /**
              * use location.replace instead of router.push to server-side render page
              */
            location && location.replace('/')
          })
        })
      },
      toggleMenu () {
        this.$refs.headerMenu.classList.toggle('open')
      },
    },
    mounted () {
      this.isClientSide = true
    },
    beforeMount () {
      checkLoginStatus(this.$store).then(() => {
        if (this.isLoggedIn) {
          return getProfile(this.$store)
        }
        return
      })
    },
    props: [ 'sections', ],
  }
</script>
<style lang="stylus" scoped>
  .header
    display flex
    justify-content flex-end
    align-items center
    position fixed
    top 0
    left 0
    right 0
    z-index 999
    width 100%
    height 40px
    padding 0 15px 0 75px
    background-color #444746
    &__logo
      position absolute
      top 8px
      left 15px
      width 50px
      height auto
    &__item
      height 20px
      padding 0 10px
      border-left 1px solid #fff
      &:last-of-type
        padding-right 0
    &__status
      display flex
      align-items center
      &-item
        position relative
        height 20px
        color #fff
        font-size .85rem
        font-weight 300
        line-height 20px
        &.header--nickname
          padding 0 34px 0 10px
          color #ddcf21 
          &::before
            content ''
            position absolute
            bottom 0
            right 10px
            width 14px
            height 15px
            background-color transparent
            background-image url(/public/icons/account.png)
            background-position center center
            background-repeat no-repeat
            background-size contain
    &--hamburger
      display flex
      flex-direction column
      justify-content space-around
      // padding 0
      background transparent
      // border none
      outline none
    &--account
      p
        display none
        margin 0
        color #ddcf21
      img
        height 30px
    &__hamburgerBar
      width 20px
      height 2px
      background-color #fff
    &__menu
      position absolute
      top 0
      left 0
      right 0
      bottom 0
      z-index 10
      width 100%
      height 100vh
      margin 0
      opacity 0
      visibility hidden
      transition opacity 0.35s ease-out
      &.open
        visibility visible
        opacity 1
        ul
          right 0
      ul
        position relative
        right -100%
        z-index 10
        width 60%
        height 100%
        margin 0 0 0 40%
        padding 0
        background-color #ddcf21
        transition right 0.35s ease-out
        li
          position relative
          width 100%
          height 25%
          border-bottom 1px solid #fff
          list-style-type none
          &:last-of-type
            border-bottom none
          img
            position absolute
            top 50%
            left 50%
            transform translate(-50%, -50%)
            width 50px
            height 50px
      &-curtain
        position absolute
        top 0
        left 0
        bottom 0
        right 0
        width 100%
        height 100%
        background-color rgba(0, 0, 0, .6)

  @media (min-width 768px)
    .header
      height 50px
      &__logo
        width 55px
        top 14px
        left 25px
      &__status
        &-item
          font-size .875rem
      &--account
        p
          display inline
          margin-right 10px
          vertical-align top
          font-size .875rem
          line-height 20px
        img
          height 35px
</style>