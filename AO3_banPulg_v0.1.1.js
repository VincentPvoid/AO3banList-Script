// ==UserScript==
// @name         AO3屏蔽某作者文章和某用户评论
// @namespace    https://github.com/VincentPvoid
// @version      0.1.1
// @description  一个简单的屏蔽特定AO3作者和特定用户评论的脚本
// @author       VincentPViod
// @match        https://archiveofourown.org/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  let setting = {
    openNewPage: false, // 是否在新窗口打开文章
    quickKudo: false,   // 是否打开快捷点赞
    showBanBtn: true, // 是否显示屏蔽作者按钮
    useBanAuthors: true, // 是否屏蔽黑名单作者文章
    useBanUsers: true, // 是否屏蔽黑名单用户
  }
  let banAuthorsList = []; // 屏蔽作者列表
  // 保存的屏蔽作者列表
  let localBanAuthorsList = JSON.parse(window.localStorage.getItem('vpv_ban_list'));
  if (localBanAuthorsList && localBanAuthorsList.length) {
    banAuthorsList = localBanAuthorsList;
  }

  let banUsersList = []; // 屏蔽用户列表
  // 保存的屏蔽用户列表
  let localBanUsersList = JSON.parse(window.localStorage.getItem('vpv_ban_users_list'));
  if (localBanUsersList && localBanUsersList.length) {
    banUsersList = localBanUsersList;
  }
  // 监视评论列表的计时器
  let watchCommentsListTimer = null;


  // 生成打开设置菜单按钮
  let btnOpenSetting = document.createElement('div');
  btnOpenSetting.setAttribute('id', 'vpv_AO3_switch_btn');
  btnOpenSetting.innerHTML = 'AO3插件设置';

  // 生成顶部提示
  let topTip = document.createElement('div');
  topTip.setAttribute('id', 'vpv_top_tip');
  topTip.innerHTML = '';
  document.body.appendChild(topTip);

  // 生成整体容器；覆盖整个页面
  let mainDivCover = document.createElement('div');
  mainDivCover.setAttribute('id', 'vpv_AO3_main_cover');
  mainDivCover.innerHTML = `
    <div class="vpv-AO3-main-con">
      <div class="btn-close">x</div>
      <h3 class="title">AO3插件 v0.1.1</h3>
      <div class="setting-items">
        <label>
          <input type="checkbox"> 新窗口打开文章
        </label>
      </div>
      <div class="setting-items">
        <label>
          <input type="checkbox"> 快捷点赞（快键键[K]）
        </label>
      </div>
      <div class="setting-items">
        <label>
          <input type="checkbox" checked> 显示屏蔽作者按钮
        </label>
      </div>
      <div class="setting-items">
        <label>
          <input type="checkbox" checked> 屏蔽作者文章
        </label>
      </div>
      <div class="setting-items">
        <button class="btn-authors-list">名单管理</button>
      </div>
      <div class="setting-items">
        <label>
          <input type="checkbox" checked> 屏蔽用户评论
        </label>
      </div>
      <div class="setting-items">
        <button class="btn-users-list">名单管理</button>
      </div>
      <button class="btn-save">保存设置</button>

      <div class="inner-cover-authors">
        <div class="ban-authors-list-con">
          <div class="btn-close">x</div>
          <h4>屏蔽作者名单管理</h4>
          <div class="ban-authors-list">
            <table>
              <thead>
                <tr>
                  <th>用户名</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>

              </tbody>
            </table>
          </div>
          <button class="btn-open-add-author">添加作者</button>
          <div class="add-author-con">
            <div>
              <div class="btn-close">x</div>
            </div>
            <p>添加作者</p>
            <input type="text" placeholder="作者名" class="add-input">
            <button class="btn-add-author">添加</button>
          </div>
        </div>
      </div>

      <div class="inner-cover-users">
        <div class="ban-users-list-con">
          <div class="btn-close">x</div>
          <h4>屏蔽用户名单管理</h4>
          <div class="ban-users-list">
            <table>
              <thead>
                <tr>
                  <th>用户名</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>

              </tbody>
            </table>
          </div>
          <button class="btn-open-add-user">添加用户</button>
          <div class="add-user-con">
            <div>
              <div class="btn-close">x</div>
            </div>
            <p>添加用户</p>
            <input type="text" placeholder="用户名" class="add-input">
            <button class="btn-add-user">添加</button>
          </div>
        </div>
      </div>
      </div>`;

  // 把需要的结构插入body中
  document.body.appendChild(mainDivCover);


  // 保存的设置
  let localSetting = window.localStorage.getItem('vpv_AO3_setting');
  if (JSON.parse(localSetting)) {
    // console.log(localSetting)
    setting = JSON.parse(localSetting);
    let settingItems = document.querySelectorAll('#vpv_AO3_main_cover .setting-items input');
    settingItems[0].checked = setting.openNewPage;
    settingItems[1].checked = setting.quickKudo;
    settingItems[2].checked = setting.showBanBtn;
    settingItems[3].checked = setting.useBanAuthors;
    settingItems[4].checked = setting.useBanUsers;
  }

  // 在新窗口打开文章
  if (setting.openNewPage) {
    let titlesA = document.querySelectorAll('#main h4.heading a:first-child');
    for (let i = 0; i < titlesA.length; i++) {
      titlesA[i].target = '_blank';
    }
  }

  // 按K快捷点赞；当focus文本框时不触发
  if (setting.quickKudo) {
    document.onkeyup = function (e) {
      // 选中kudo按钮
      let btnKudo = document.querySelector('#new_kudo [type="submit"]');

      // 监听键盘事件，当e.target为input和textarea时不触发事件
      // 注意：kudo键本身为input；如果focus在kudo键上也不能触发事件
      if (e.keyCode === 75 && !(e.target.nodeName === 'INPUT' || e.target.nodeName === 'TEXTAREA')) {
        window.scroll(0, btnKudo.offsetTop);
        btnKudo.click();
        // console.log('kudos')
      }
    }
  }

  // 所有作者列表数组
  let authors = document.querySelectorAll('h4.heading [rel="author"]');
  authors = [].slice.call(authors);

  // 如果选择屏蔽作者功能打开
  if (setting.useBanAuthors && banAuthorsList.length && authors.length) {
    for (let i = 0; i < banAuthorsList.length; i++) {
      let tars = authors.filter((item) => item.innerHTML === banAuthorsList[i]);
      tars.forEach((item) => {
        // a --- h4 --- div -- li
        let li = item.parentElement.parentElement.parentElement;
        // li.style.display = 'none';
        li.parentElement.removeChild(li);
      })
    }
  }

  // 打开设置菜单
  btnOpenSetting.addEventListener('click', () => {
    let mainDivCover = document.querySelector('#vpv_AO3_main_cover');
    mainDivCover.style.display = 'flex';
    // console.log('abc')
  })

  // 把开关插入左上用户导航栏
  let greeting = document.querySelector('#greeting') ? document.querySelector('#greeting') : document.querySelector('#login');
  // 如果没有该结构，则不插入
  if (greeting != null) {
    greeting.insertBefore(btnOpenSetting, greeting.children[0]);
  }


  // 关闭按钮事件
  let btnCloses = document.querySelectorAll('#vpv_AO3_main_cover .btn-close');
  for (let i = 0; i < btnCloses.length; i++) {
    btnCloses[i].addEventListener('click', () => {
      let tar = btnCloses[i].parentElement.parentElement;
      tar.style.display = 'none';
    })
  }

  // let confirmBan = document.querySelector('#confirm_ban');
  // let authors = document.querySelectorAll('h4.heading [rel="author"]');


  /*
  屏蔽作者相关
  */

  // 生成屏蔽作者按钮
  if (setting.showBanBtn) {
    for (let i = 0; i < authors.length; i++) {
      let tar = authors[i].parentElement;
      let btnBan = document.createElement('div');
      btnBan.setAttribute('class', 'vpv-AO3-ban-btn');
      btnBan.innerHTML = '屏蔽该作者';
      tar.appendChild(btnBan);

      // 点击 屏蔽该作者 按钮把作者加入黑名单
      btnBan.addEventListener('click', function () {
        // console.log(authors[i].textContent);
        let text = authors[i].textContent;
        if (banAuthorsList.indexOf(text) === -1) {
          banAuthorsList.push(text);
        }
        window.localStorage.setItem('vpv_ban_list', JSON.stringify(banAuthorsList));
        showTopTip(topTip, '屏蔽成功，刷新后生效');
      })
    }
  }

  // 生成屏蔽作者名单列表
  let banAuthorsTable = document.querySelector('#vpv_AO3_main_cover .ban-authors-list table');
  if (banAuthorsList.length) {
    for (let i = 0; i < banAuthorsList.length; i++) {
      let tr = document.createElement('tr');
      tr.innerHTML = `<td>${banAuthorsList[i]}</td>
          <td><button class="btn-delete">删除</button></td>`;
      banAuthorsTable.querySelector('tbody').appendChild(tr);
    }
  }
  // 点击删除，删除作者名单列表条目
  banAuthorsTable.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete')) {
      let tr = e.target.parentElement.parentElement;
      let value = tr.querySelector('td').innerHTML;
      // console.log(value)
      tr.parentElement.removeChild(tr);
      banAuthorsList = banAuthorsList.filter((item) => item != value);
      window.localStorage.setItem('vpv_ban_list', JSON.stringify(banAuthorsList));
    }
  })


  // 打开屏蔽作者名单列表
  let btnAnthorsList = document.querySelector('#vpv_AO3_main_cover .btn-authors-list');
  btnAnthorsList.addEventListener('click', () => {
    let listCover = document.querySelector('#vpv_AO3_main_cover .inner-cover-authors');
    listCover.style.display = 'block';
  })

  // 打开添加作者弹框
  let btnOpenAddAuthor = document.querySelector('#vpv_AO3_main_cover .btn-open-add-author');
  btnOpenAddAuthor.addEventListener('click', () => {
    let addAuthorCon = document.querySelector('#vpv_AO3_main_cover .add-author-con');
    addAuthorCon.style.display = 'block';
  })

  let btnAddAuthor = document.querySelector('#vpv_AO3_main_cover .btn-add-author');
  // 添加作者进入屏蔽列表
  btnAddAuthor.addEventListener('click', () => {
    let par = btnAddAuthor.parentElement;
    let input = par.querySelector('.add-input');
    console.log(input.value)
    let text = input.value.trim();
    if (text === '') {
      showTopTip(topTip, '请输入作者名');
      return;
    }
    if (banAuthorsList.indexOf(text) === -1) {
      banAuthorsList.push(text);
      window.localStorage.setItem('vpv_ban_list', JSON.stringify(banAuthorsList));

      let tr = document.createElement('tr');
      tr.innerHTML = `<td>${text}</td>
          <td><button class="btn-delete">删除</button></td>`;
      banAuthorsTable.querySelector('tbody').appendChild(tr);
    }
    input.value = '';
    // 关闭添加作者弹框
    par.style.display = 'none';
  })


  // 选中显示/隐藏评论按钮
  let showCommentBtn = document.querySelector('#show_comments_link')

  // 如果屏蔽用户功能打开
  if (setting.useBanUsers && banUsersList.length && showCommentBtn) {
    // 选择当前显示所有评论（不包括被折叠评论）
    // 注意：评论列表为异步获取，因此在加载页面时无法直接获取
    // let comments = document.querySelectorAll('#comments_placeholder li.comment')

    // 判断当前评论按钮状态（有Hide表示评论列表已经展开）
    if (showCommentBtn.innerText.indexOf('Hide') != -1) {
      clearInterval(watchCommentsListTimer);
      let usersComments = document.querySelectorAll('#comments_placeholder li.comment .heading a')
      filterUserList(banUsersList, usersComments);

      watchCommentsListTimer = setInterval(() => {
        // console.log(456)
        let newUsersComments = document.querySelectorAll('#comments_placeholder li.comment .heading a')
        if (newUsersComments[0] != usersComments[0]) {
          filterUserList(banUsersList, newUsersComments);
          usersComments = newUsersComments;
        }
      }, 200)
    }

    // 给评论按钮添加点击事件
    showCommentBtn.addEventListener('click', function () {
      clearInterval(watchCommentsListTimer);
      let usersComments = document.querySelectorAll('#comments_placeholder li.comment .heading a')
      // 点击按钮时按钮依然保持之前的状态
      // 如果点击时有Hide表示收起；没有表示展开
      if (this.innerText.indexOf('Hide') === -1) {
        watchCommentsListTimer = setInterval(() => {
          // console.log(123)
          let newUsersComments = document.querySelectorAll('#comments_placeholder li.comment .heading a')
          if (newUsersComments[0] != usersComments[0]) {
            filterUserList(banUsersList, newUsersComments);
            usersComments = newUsersComments;
          }
        }, 200)
      }
    })
    
  }




  /*
  屏蔽用户相关
  */

  // 生成屏蔽用户名单列表
  let banUsersTable = document.querySelector('#vpv_AO3_main_cover .ban-users-list table');
  if (banUsersList.length) {
    for (let i = 0; i < banUsersList.length; i++) {
      let tr = document.createElement('tr');
      tr.innerHTML = `<td>${banUsersList[i]}</td>
          <td><button class="btn-delete">删除</button></td>`;
      banUsersTable.querySelector('tbody').appendChild(tr);
    }
  }
  // 点击删除，删除用户名单列表条目
  banUsersTable.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete')) {
      let tr = e.target.parentElement.parentElement;
      let value = tr.querySelector('td').innerHTML;
      // console.log(value)
      tr.parentElement.removeChild(tr);
      banUsersList = banUsersList.filter((item) => item != value);
      window.localStorage.setItem('vpv_ban_users_list', JSON.stringify(banUsersList));
    }
  })


  // 打开屏蔽用户名单列表
  let btnUsersList = document.querySelector('#vpv_AO3_main_cover .btn-users-list');
  btnUsersList.addEventListener('click', () => {
    let listCover = document.querySelector('#vpv_AO3_main_cover .inner-cover-users');
    listCover.style.display = 'block';
  })

  // 打开添加用户弹框
  let btnOpenAddUser = document.querySelector('#vpv_AO3_main_cover .btn-open-add-user');
  btnOpenAddUser.addEventListener('click', () => {
    let addUserCon = document.querySelector('#vpv_AO3_main_cover .add-user-con');
    addUserCon.style.display = 'block';
  })

  let btnAddUser = document.querySelector('#vpv_AO3_main_cover .btn-add-user');
  // 添加用户进入屏蔽列表
  btnAddUser.addEventListener('click', () => {
    let par = btnAddUser.parentElement;
    let input = par.querySelector('.add-input');
    console.log(input.value)
    let text = input.value.trim();
    if (text === '') {
      showTopTip(topTip, '请输入用户名');
      return;
    }
    if (banUsersList.indexOf(text) === -1) {
      banUsersList.push(text);
      window.localStorage.setItem('vpv_ban_users_list', JSON.stringify(banUsersList));

      let tr = document.createElement('tr');
      tr.innerHTML = `<td>${text}</td>
          <td><button class="btn-delete">删除</button></td>`;
      banUsersTable.querySelector('tbody').appendChild(tr);
    }
    input.value = '';
    // 关闭添加用户弹框
    par.style.display = 'none';
  })





  // 保存设置
  let btnSaveSetting = document.querySelector('#vpv_AO3_main_cover .btn-save');
  btnSaveSetting.addEventListener('click', () => {
    let settingItems = document.querySelectorAll('#vpv_AO3_main_cover .setting-items input');
    setting.openNewPage = settingItems[0].checked;
    setting.quickKudo = settingItems[1].checked;
    setting.showBanBtn = settingItems[2].checked;
    setting.useBanAuthors = settingItems[3].checked;
    setting.useBanUsers = settingItems[4].checked;
    window.localStorage.setItem('vpv_AO3_setting', JSON.stringify(setting));

    // 关闭设置窗口
    // .btn-save --- .vpv-AO3-main-con --- vpv_AO3_main_cover
    btnSaveSetting.parentElement.parentElement.style.display = 'none';

    // 弹出提示
    showTopTip(topTip, '保存成功，刷新后生效');
    // topTip.style.display = 'block';
    // topTip.innerHTML = '保存成功，刷新后生效';
    // setTimeout(() => {
    //   topTip.style.display = 'none';
    // }, 2000);
  })




  // 顶部提示公共函数 ele与元素容器 str内容
  function showTopTip(ele, str) {
    ele.style.display = 'block';
    ele.innerHTML = str;
    setTimeout(() => {
      ele.style.display = 'none';
    }, 2000);
  }

  // 过滤用户函数
  // banUsersList当前保存的屏蔽用户列表；usersComments当前所有评论列表
  function filterUserList(banUsersList, usersComments) {
    // console.log('--------',usersComments)
    usersComments = [].slice.call(usersComments);
    for (let i = 0; i < banUsersList.length; i++) {
      let tars = usersComments.filter((item) => item.innerHTML === banUsersList[i]);
      tars.forEach((item) => {
        // a --- h4 -- li
        let li = item.parentElement.parentElement;
        // li.style.display = 'none';
        li.parentElement.removeChild(li);
      })
    }
  }




  /*
  样式
  */
  const style = document.createElement("style");
  style.type = "text/css";
  style.innerHTML = ` #vpv_AO3_switch_btn {
      display: inline-block;
      padding:.8em 0;
      margin: 0 10px;
      font-size: inherit;
    }

    #vpv_AO3_switch_btn:hover {
      background: #ddd;
      color: #900;
      cursor: pointer;
    }

    .vpv-AO3-ban-btn {
      display: inline-block;
      padding: 0 3px;
      margin: 0 1em;
      font-size: 14px;
      color: #aaa;
      border-radius: 5px;
    }

    .vpv-AO3-ban-btn:hover {
      color: #fff;
      background: #900;
      cursor: pointer;
    }

    #vpv_top_tip {
      display: none;
      position: fixed;
      top: 5px;
      left: 50%;
      z-index: 10;
      transform: translate(-50%);
      padding: 5px;
      border: 1px solid #333;
      background: #d1e1ef;
    }

    #vpv_AO3_main_cover {
      display:none;
      align-items: center;
      justify-content: center;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 999;
      background: transparent;
      width: 100%;
      height: 100%;
    }

    #vpv_AO3_main_cover h3 {
      margin: 10px 0;
    }

    #vpv_AO3_main_cover .vpv-AO3-main-con {
      display: flex;
      flex-direction: column;
      position: relative;
      width: 300px;
      padding: 10px 20px;
      border: 1px solid #ccc;
      background: #fff;
      box-shadow: 0 0 5px #333;
    }

    #vpv_AO3_main_cover .setting-items {
      margin: 5px 0;
      vertical-align: middle;
    }

    #vpv_AO3_main_cover .btn-save {
      margin-top: 30px;
    }

    #vpv_AO3_main_cover [class^="btn"] {
      padding: 5px 10px;
      background: #eee;
      border: 1px solid #ccc;
      outline: none;
      line-height: 16px;
      text-decoration: none;
      color: #000;
      font-size: 15px;
    }

    #vpv_AO3_main_cover [class^="btn"]:hover {
      background: #900;
      border: 1px solid #900;
      color: #fff;
      cursor: pointer;
    }

    #vpv_AO3_main_cover .btn-close {
      position: absolute;
      top: 10px;
      right: 10px;
      border: 1px solid #ccc;
      padding: 3px 8px;
      font-size: 18px;
    }

    #vpv_AO3_main_cover [class^=inner-cover] {
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    #vpv_AO3_main_cover .ban-authors-list-con,
    #vpv_AO3_main_cover .ban-users-list-con {
      position: absolute;
      top: -30%;
      left: -10px;
      background: #fff;
      width: 100%;
      padding: 0 10px;
      height: 500px;
      border: 1px solid #ccc;
      box-shadow: 0 0 5px #333;
    }

    #vpv_AO3_main_cover .ban-authors-list,
    #vpv_AO3_main_cover .ban-users-list {
      height: 360px;
      border: 1px solid #ccc;
      margin: 20px 0;
      line-height: 2.5;
      text-align: left;
      overflow: auto;
    }

    #vpv_AO3_main_cover table {
      border-collapse: collapse;
      width: 100%;
      overflow: hidden;
    }

    #vpv_AO3_main_cover th,
    tr,
    td {
      border: 1px solid #ccc;
      padding: 0 10px;
    }

    #vpv_AO3_main_cover tbody {
      height: auto;
    }

    #vpv_AO3_main_cover .add-author-con,
    #vpv_AO3_main_cover .add-user-con {
      display: none;
      position: absolute;
      bottom: 10px;
      background: #fff;
      border: 1px solid #aaa;
      padding: 10px;
      box-shadow: 0 0 5px #333;
    }

    #vpv_AO3_main_cover p {
      margin: 5px 0;
    }

    #vpv_AO3_main_cover .add-input {
      line-height: 1.5;
      font-size: 15px;
      outline: none;
    }`;
  document.querySelector('head').appendChild(style);
})();
