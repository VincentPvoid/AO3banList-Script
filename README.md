# AO3banList-Script
一个简单的屏蔽AO3作者的油猴脚本  
虽然AO3本身tag系统已经很方便筛选了，但有时还是会有些没过滤到的文章，或者有时只是不喜欢某些作者，可能有时还是需要拉黑作者的功能  
主要是我自己需要所以就写了，包括快捷点kudo和新窗口打开这种其实用处并不大的功能  

## v0.1.1版本 20-11-20
添加了屏蔽特定用户评论的功能  

## v0.1.2版本 20-12-09
添加了导入/导出名单功能  
导出的数据转换成了base64格式；虽然其实没有太大必要，AO3的用户名不会有中文也不会有特殊字符

## v0.1.3版本 20-12-25
添加了一键清空列表功能  
虽然这功能必要性不是太大，直接关闭对应的屏蔽列表就可以达到目的；不过还是顺手加上了

## v0.1.4版本 21-05-23
添加了清空无效作者功能：此作者名不存在或此作者名下没有作品，则会被清除；清除速度与网速和名单长度有关  
如果屏蔽作者名单太长会有问题，频繁使用该功能也会有问题；总之功能不是很完善，不过用于我自己的屏蔽名单清理足够了

## v0.1.5版本 21-10-13
添加快捷屏蔽orphan_account账号功能：如果需要屏蔽orphan_account账号的文章，可以使用此功能  
把orphan_account添加到屏蔽列表也可以实现屏蔽功能，但删除可能会比较麻烦，就单独拿出来处理了；  
虽然一般也用不上这个，可能主要是防止添加orphan_account进屏蔽名单导致的问题；清除无效作者功能可以删除orphan_account名称关键词并提示

## v0.1.6版本 21-10-21
修复清空无效作者功能的问题；添加了清理时的文字提示  
如果屏蔽作者名单太长，则隔一段时间再继续进行清理；清理所需时间和名单长度有关

## v0.1.7版本 22-04-02
添加关键词屏蔽功能；可以进行标题和简介/仅标题/仅简介的屏蔽  
该功能大小写敏感，所以屏蔽英文的时候需要区分大小写，不是太方便；可能之后会改进  
这个功能我基本用不上所以没有做太多测试，所以可能问题比较多  
没有进行tag检测，官方本身就可以设置tag过滤所以没做

## v0.1.8版本 22-11-21
修复清空无效作者功能的问题  
如果屏蔽列表中使用的是别名，检测时请求的作者主页地址不同，需要进行处理  
之前的版本没有处理，会把存在的作者也清理掉  
虽然这个功能基本只有我这种强迫症才需要使用，但既然发现了还是顺便处理一下  

## v0.1.9版本 22-11-22
本来没打算分两个版本，但在greasyfork上的版本号出了点问题，所以分开了一个新版本  
添加切换显示/隐藏文章中图片的功能  
该功能打开时自动隐藏图片，可以切换显示/隐藏  
这个功能主要是方便隐藏一些nsfw图片  
在文章里放一堆gif图感觉严重影响观感，所以隐藏了；只是隐藏而没有阻止加载，所以并不能省流

## v0.2.0版本 23-03-03
修改了一下切换显示/隐藏图片按钮的文字显示和该按钮的位置  
功能上没改动，只是显示上的修改而已  
不过更新到2.0之后就应该不会有版本号问题了吧

## v0.2.1版本 25-04-27
在标题上登录可见的图标不需要切换显示/隐藏功能，所以去掉了，主要是显示起来太丑了  
功能上没有改动，只是显示上的修改  
顺带更新了一下README文件的日期，加上了年份

## 功能
- 新窗口打开文章
- 快捷点赞[K]
- 根据用户名屏蔽作者文章（如果作者更换了用户名会失效）
- 根据用户名屏蔽用户评论，无法屏蔽未登录（匿名）用户评论（如果用户更换了用户名会失效）；对于反复横跳修改用户名的也没有办法
- 导入/导出名单数据
- 一键清空列表
- 清空无效作者（此作者名不存在或此作者名下没有作品，则会被清除；清理所需时间和名单长度有关）；如果屏蔽作者名单太长，或是频繁使用该功能，会需要冷却时间，导致清理时间很长（AO3对一段时间内的请求有限制，因此名单数量过多需要隔一段时间再继续进行请求）
- 快捷屏蔽orphan_account账号功能
- 屏蔽标题/简介中带有关键词的文章
- 切换显示/隐藏文章图片


## to do
修改存储数据格式
