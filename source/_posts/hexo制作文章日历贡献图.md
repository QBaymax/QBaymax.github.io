---
title: hexo制作文章日历贡献图
date: 2025-11-14 13:18:05
categories: [Program]  # 将文章归入“日记”分类
tags: [hexo]
diary: false
postDesc: 在 AI 的帮助写实现了类似 Github 的提交日历贡献图
---

因为之前经常喜欢用 flomo 做日记，flomo 很多有意思的小功能非常吸引我，其中一个就是文章日历贡献图，而在 Github 中也有一个 提交日历贡献图。所以我就也想在自己的网页中实现类似的一个效果，这里我主要展示一下主要的代码，具体逻辑就不细讲了，代码还是蛮清楚的，只需要创建两个文件即可，一个是`calendar.pug`，一个是`calendar.css`。

### 实现效果图
具体操控可以到 `历史` 这一栏进行查看

![Snipaste_2025-11-14_13-26-52.png](Snipaste_2025-11-14_13-26-52.png)

### Calendar.pug 代码实现
```js
mixin diaryCalendar()
  //- 数据处理部分
  - const allPosts = site.posts.data
  - const postStats = {}
  - let totalPosts = 0
  
  - allPosts.forEach((post) => {
  -   if (post && post.date) {
  -     const dateStr = post.date.format('YYYY-MM-DD')
  -     postStats[dateStr] = (postStats[dateStr] || 0) + 1
  -     totalPosts++
  -   }
  - })
  
  //- 计算起始日期 (当前日期往前推一年，并调整到网格的a/b位置)
  - const MS_PER_DAY = 24 * 60 * 60 * 1000
  - const anchorPosition = 2 / 3  // a/b位置比例
  - const today = new Date()
  - const startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
  - const daysToAdjust = Math.floor(367 / 2 - (today - startDate) / MS_PER_DAY * 2 * (1 - anchorPosition))
  - startDate.setDate(startDate.getDate() - daysToAdjust)
  
  //- 确保起始日期是周日（GitHub日历从周日开始）
  - const startDayOfWeek = startDate.getUTCDay()  // 周日=0, 周一=1, ..., 周六=6
  - startDate.setUTCDate(startDate.getUTCDate() - startDayOfWeek)

  //- 计算月份标签
  - const startMonth = startDate.getMonth() + 1
  
  //- 计算当前日期在月份中的位置（上中下旬）
  - const currentDay = today.getDate()
  - let monthOffset = 0
  - if (currentDay <= 10) {
  -   monthOffset = -15
  - } else if (currentDay <= 20) {
  -   monthOffset = 0
  - } else {
  -   monthOffset = 15
  - }

  //- 引入CSS文件
  link(rel="stylesheet", href=url_for("/css/calendar.css"))

  .diary-calendar
    .calendar-header
      h2 文章贡献日历
      .calendar-stats
        span 总共 #{totalPosts} 篇文章，覆盖 #{Object.keys(postStats).length} 天
    
    .calendar-scroll-container
      .calendar-months
        //- 月份标签
        - const startPX = 20
        - const gapPx = 65
        .month-label(style=`left: ${startPX + 0 *gapPx + monthOffset}px`) #{startMonth}月
        .month-label(style=`left: ${startPX + 1 *gapPx + monthOffset}px`) #{(startMonth % 12) + 1}月
        .month-label(style=`left: ${startPX + 2 *gapPx + monthOffset}px`) #{((startMonth + 1) % 12) + 1}月
        .month-label(style=`left: ${startPX + 3 *gapPx + monthOffset}px`) #{((startMonth + 2) % 12) + 1}月
        .month-label(style=`left: ${startPX + 4 *gapPx + monthOffset}px`) #{((startMonth + 3) % 12) + 1}月
        .month-label(style=`left: ${startPX + 5 *gapPx + monthOffset}px`) #{((startMonth + 4) % 12) + 1}月
        .month-label(style=`left: ${startPX + 6 *gapPx + monthOffset}px`) #{((startMonth + 5) % 12) + 1}月
        .month-label(style=`left: ${startPX + 7 *gapPx + monthOffset}px`) #{((startMonth + 6) % 12) + 1}月
        .month-label(style=`left: ${startPX + 8 *gapPx + monthOffset}px`) #{((startMonth + 7) % 12) + 1}月
        .month-label(style=`left: ${startPX + 9 *gapPx + monthOffset}px`) #{((startMonth + 8) % 12) + 1}月
        .month-label(style=`left: ${startPX + 10*gapPx + monthOffset}px`) #{((startMonth + 9) % 12) + 1}月
        .month-label(style=`left: ${startPX + 11*gapPx + monthOffset}px`) #{((startMonth + 10) % 12) + 1}月
        //- .month-label(style=`left: ${startPX + 12*gapPx + monthOffset}px`) #{((startMonth + 11) % 12) + 1}月
      
      .canvas
        .calendar-weekdays
          //- 修正星期标签顺序（GitHub从周日开始）
          .calendar-weekday 
          .calendar-weekday 一
          .calendar-weekday 
          .calendar-weekday 三
          .calendar-weekday 
          .calendar-weekday 五
          .calendar-weekday 
          
        .calendar-wrapper
          .calendar-grid
            //- 生成371个格子（53周）
            - let currentDate = new Date(startDate)
            - const totalDays = 53 * 7
            
            - for (let i = 0; i < totalDays; i++)
              - const dateStr = currentDate.toISOString().split('T')[0]
              - const count = postStats[dateStr] || 0
              - const isInRange = currentDate <= new Date(today.getTime() + 24 * 60 * 60 * 1000)
              - 
              if (isInRange)
                .calendar-day(
                  data-date=dateStr,
                  data-count=count,
                  title=`${dateStr}: ${count}篇文章`
                )
              else
                .calendar-day(
                  data-date=dateStr,
                  data-count="0",
                  title="",
                  style="background: #f6f8fa; opacity: 0.3;"
                )
              - currentDate.setDate(currentDate.getDate() + 1)
    
    .calendar-legend
      span 少
      .legend-item(style="background: #ebedf0")
      .legend-item(style="background: #9be9a8")
      .legend-item(style="background: #40c463")
      .legend-item(style="background: #30a14e") 
      .legend-item(style="background: #216e39")
      span 多

  script.
    document.addEventListener('DOMContentLoaded', function() {
      const calendarDays = document.querySelectorAll('.calendar-day');
      
      calendarDays.forEach(day => {
        day.addEventListener('mouseenter', function(e) {
          const count = this.getAttribute('data-count');
          if (count > 0) {
            this.style.border = '1px solid #333';
          }
        });
        
        day.addEventListener('mouseleave', function() {
          this.style.border = 'none';
        });
      });
    });
```

### Calendar.css 代码实现
```css
/* calendar.css */
.diary-calendar {
  max-width: 900px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.diary-calendar .calendar-scroll-container {
  overflow-x: auto;
  padding-bottom: 10px;
  margin-bottom: 5px;
}

.diary-calendar .calendar-scroll-container::-webkit-scrollbar {
  height: 8px;
}

.diary-calendar .calendar-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.diary-calendar .calendar-scroll-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.diary-calendar .calendar-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.diary-calendar .calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.diary-calendar .calendar-header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.diary-calendar .calendar-stats {
  font-size: 0.9rem;
  color: #666;
}

.diary-calendar .calendar-months {
  position: relative;
  height: 20px;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  color: #666;
  padding-left: 16.2px; /* 为星期标签留出空间 */
  min-width: 795px; /* 53 * 15px */
}

.diary-calendar .month-label {
  position: absolute;
  top: 0;
}

.diary-calendar .canvas {
  display: flex;
  flex-direction: row;
}

.canvas .calendar-wrapper {
  display: flex;
  width: max-content;
}

.canvas .calendar-weekdays {
  display: flex;
  flex-direction: column;
  margin-right: 5px;
  font-size: 0.7rem;
  color: #666;
  width: 25px; /* 固定宽度 */
}

.canvas .calendar-weekday {
  height: 14px;
  margin: 0px 0;
  line-height: 15px;
  text-align: center;
}

/* 关键：按列排列的网格 */
.calendar-wrapper .calendar-grid {
  display: grid;
  grid-template-columns: repeat(53, 12px); /* 53列，每列12px */
  grid-template-rows: repeat(7, 12px); /* 7行，每行12px */
  grid-auto-flow: column; /* 按列填充 */
  gap: 3px;
  width: max-content;
}

.calendar-wrapper .calendar-day {
  width: 12px;
  height: 12px;
  background: #ebedf0;
  border-radius: 2px;
  position: relative;
  cursor: pointer;
  transition: all 0.1s ease;
}

.calendar-wrapper .calendar-day:hover {
  transform: scale(1.3);
  z-index: 10;
  border: 1px solid #333;
}

.calendar-wrapper .calendar-day[data-count="1"] { background: #9be9a8; }
.calendar-wrapper .calendar-day[data-count="2"] { background: #40c463; }
.calendar-wrapper .calendar-day[data-count="3"] { background: #30a14e; }
.calendar-wrapper .calendar-day[data-count="4"] { background: #216e39; }

.diary-calendar .calendar-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #666;
  gap: 5px;
}

.diary-calendar .legend-item {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}
```

具体如何导入就看自己网页的架构了，这里主要做代码分享。