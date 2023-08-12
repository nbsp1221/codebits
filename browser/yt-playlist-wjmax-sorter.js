async function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

class YouTubePlaylist {
  constructor(authorization) {
    this.authorization = authorization;

    this.innertubeApiKey = window.ytcfg.data_.INNERTUBE_API_KEY;
    this.innertubeContext = window.ytcfg.data_.INNERTUBE_CONTEXT;
    this.playlistId = new URLSearchParams(window.location.search).get('list');

    this.contents = window
      .ytInitialData
      .contents
      .twoColumnBrowseResultsRenderer
      .tabs[0]
      .tabRenderer
      .content
      .sectionListRenderer
      .contents[0]
      .itemSectionRenderer
      .contents[0]
      .playlistVideoListRenderer
      .contents
      .map((value) => value.playlistVideoRenderer);
  }

  async moveVideoAfter(setVideoId, movedSetVideoIdPredecessor) {
    const response = await fetch(`https://www.youtube.com/youtubei/v1/browse/edit_playlist?key=${this.innertubeApiKey}`, {
      method: 'POST',
      headers: {
        'Authorization': this.authorization,
      },
      body: JSON.stringify({
        context: {
          ...this.innertubeContext,
        },
        actions: [
          {
            action: 'ACTION_MOVE_VIDEO_AFTER',
            setVideoId,
            movedSetVideoIdPredecessor,
          },
        ],
        params: 'CAFAAQ%3D%3D',
        playlistId: this.playlistId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to move video after');
    }

    return await response.json();
  }

  async sortContents(compareFn) {
    const sortedContents = [...this.contents].sort(compareFn);

    console.log('Sorted contents:', sortedContents.map((value) => value.title.runs[0].text));
    console.log('Starting to sort ...');

    for (let i = 0; i < sortedContents.length; i++) {
      if (sortedContents[i].videoId === this.contents[i].videoId) {
        continue;
      }

      console.log(`Moving ${sortedContents[i].title.runs[0].text} to ${i} ...`);

      await this.moveVideoAfter(sortedContents[i].setVideoId, this.contents[i - 1]?.setVideoId);
      await sleep(500);

      const targetIndex = this.contents.findIndex((value) => value.videoId === sortedContents[i].videoId);
      const targetContent = this.contents.splice(targetIndex, 1)[0];
      this.contents.splice(i, 0, targetContent);
    }

    console.log('Done!');
  }
}

function parseTitle(title) {
  let singer = '';
  let songTitle = '';

  if (title.includes(' — ')) {
    singer = title.split('】 ')[1].split(' — ')[0];
    songTitle = title.split(' — ')[1].split(' [')[0];
  }
  else {
    singer = '';
    songTitle = title.split('】 ')[1].split(' [')[0];
  }

  const level = title.match(/MESSI|ANGEL|WAKGOOD|MINSU/g).join('');

  return {
    singer,
    songTitle,
    level,
  };
}

function compareFn(aInfo, bInfo) {
  const singerOrder = ['우왁굳', '이세계 아이돌', '아이네', '징버거', '릴파', '주르르', '고세구', '비챤'];
  const levelOrder = ['MESSI', 'ANGEL', 'WAKGOOD', 'MINSU'];

  const aTitle = aInfo.title.runs[0].text;
  const bTitle = bInfo.title.runs[0].text;

  const a = parseTitle(aTitle);
  const b = parseTitle(bTitle);

  a.singerIndex = singerOrder.indexOf(a.singer);
  b.singerIndex = singerOrder.indexOf(b.singer);

  if (a.singer !== b.singer) {
    if (a.singerIndex === -1 && b.singerIndex === -1) {
      if (a.singer === '') {
        return 1;
      }

      if (b.singer === '') {
        return -1;
      }

      return a.singer.localeCompare(b.singer);
    }

    if (a.singerIndex === -1) {
      return 1;
    }

    if (b.singerIndex === -1) {
      return -1;
    }

    return a.singerIndex - b.singerIndex;
  }

  if (a.songTitle !== b.songTitle) {
    return a.songTitle.localeCompare(b.songTitle);
  }

  if (levelOrder.indexOf(a.level) !== levelOrder.indexOf(b.level)) {
    return levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);
  }

  return 0;
}

const ytPlaylist = new YouTubePlaylist('secret');
ytPlaylist.sortContents(compareFn);
