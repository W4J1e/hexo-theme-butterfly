/**
 * Butterfly
 * Related Posts
 * 按标签筛选候选文章，再按发布时间（新 → 旧）倒序排序
 */

'use strict'

hexo.extend.helper.register('related_posts', function (currentPost, allPosts) {
  let relatedPosts = []
  // 先用标签收集候选文章（按 path 去重），同时累计共享标签数作为二级排序权重；当前文章自身排除
  currentPost.tags.forEach(function (tag) {
    allPosts.forEach(function (post) {
      if (isTagRelated(tag.name, post.tags) && currentPost.path !== post.path) {
        const index = findItem(relatedPosts, 'path', post.path)
        if (index === -1) {
          relatedPosts.push({
            title: post.title,
            path: post.path,
            cover: post.cover,
            randomcover: post.randomcover,
            updated: post.updated,
            created: post.date,
            weight: 1
          })
        } else {
          relatedPosts[index].weight += 1
        }
      }
    })
  })
  if (relatedPosts.length === 0) {
    return ''
  }
  let result = ''
  const hexoConfig = hexo.config
  const config = hexo.theme.config

  const limitNum = config.related_post.limit || 6
  const dateType = config.related_post.date_type || 'created'
  const headlineLang = this._p('post.recommend')

  // 一级排序：发布时间倒序（越新越靠前）；二级排序：时间相同时共享标签越多越靠前
  const sortField = dateType === 'updated' ? 'updated' : 'created'
  relatedPosts = relatedPosts.sort(function (a, b) {
    const diff = b[sortField].valueOf() - a[sortField].valueOf()
    if (diff !== 0) return diff
    return b.weight - a.weight
  })

  if (relatedPosts.length > 0) {
    result += '<div class="relatedPosts">'
    result += `<div class="headline"><i class="fas fa-thumbs-up fa-fw"></i><span>${headlineLang}</span></div>`
    result += '<div class="relatedPosts-list">'

    for (let i = 0; i < Math.min(relatedPosts.length, limitNum); i++) {
      const cover =
        relatedPosts[i].cover === false
          ? relatedPosts[i].randomcover
          : relatedPosts[i].cover
      result += `<div><a href="${this.url_for(relatedPosts[i].path)}" title="${relatedPosts[i].title}">`
      result += `<img class="cover" src="${this.url_for(cover)}" alt="cover">`
      if (dateType === 'created') {
        result += `<div class="content is-center"><div class="date"><i class="far fa-calendar-alt fa-fw"></i> ${this.date(relatedPosts[i].created, hexoConfig.date_format)}</div>`
      } else {
        result += `<div class="content is-center"><div class="date"><i class="fas fa-history fa-fw"></i> ${this.date(relatedPosts[i].updated, hexoConfig.date_format)}</div>`
      }
      result += `<div class="title">${relatedPosts[i].title}</div>`
      result += '</div></a></div>'
    }

    result += '</div></div>'
    return result
  }
})

function isTagRelated (tagName, TBDtags) {
  let result = false
  TBDtags.forEach(function (tag) {
    if (tagName === tag.name) {
      result = true
    }
  })
  return result
}

function findItem (arrayToSearch, attr, val) {
  for (let i = 0; i < arrayToSearch.length; i++) {
    if (arrayToSearch[i][attr] === val) {
      return i
    }
  }
  return -1
}
