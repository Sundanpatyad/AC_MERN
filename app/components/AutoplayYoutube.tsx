import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';

const SHARE_SCRIPT = `
(function () {
  function send(payload) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    }
  }
  try {
    navigator.canShare = function () { return true; };
    navigator.share = function (data) {
      send({
        type: 'share',
        title: data && data.title,
        text: data && data.text,
        url: data && data.url
      });
      return Promise.resolve();
    };
  } catch (e) {}
  var open = window.open;
  window.open = function (url) {
    send({ type: 'share', url: url || '' });
    return null;
  };
  function shrinkControls() {
    if (document.getElementById('ac-yt-controls')) return;
    var style = document.createElement('style');
    style.id = 'ac-yt-controls';
    style.textContent = [
      '.ytp-chrome-bottom{height:34px !important;}',
      '.ytp-chrome-controls{height:34px !important;}',
      '.ytp-chrome-bottom .ytp-button,.ytp-chrome-top .ytp-button{width:32px !important;height:32px !important;}',
      '.ytp-chrome-bottom .ytp-button svg,.ytp-chrome-top .ytp-button svg{width:20px !important;height:20px !important;}',
      '.ytp-time-display{font-size:11px !important;line-height:34px !important;}',
      '.ytp-large-play-button{width:52px !important;height:52px !important;margin-left:-26px !important;margin-top:-26px !important;}',
      '.ytp-large-play-button svg{width:52px !important;height:52px !important;}',
      '.ytp-double-tap-ui .ytp-double-tap-icon,.ytp-seek-icon{transform:scale(0.72);}'
    ].join('');
    (document.head || document.documentElement).appendChild(style);
  }
  shrinkControls();
  var ticks = 0;
  var timer = setInterval(function () {
    shrinkControls();
    ticks += 1;
    if (ticks > 12) clearInterval(timer);
  }, 400);
  true;
})();
`;

function isShareUrl(url: string) {
  return /whatsapp|wa\.me|t\.me|telegram|twitter|x\.com\/intent|facebook|fb\.com|intent:|mailto:|sms:|share/i.test(
    url
  );
}

type Props = {
  videoId: string;
  height: number;
  width: number;
  onShare?: (payload?: { title?: string; text?: string; url?: string }) => void;
};

export function AutoplayYoutube({ videoId, height, width, onShare }: Props) {
  const id = videoId.replace(/[^a-zA-Z0-9_-]/g, '');
  const source = useMemo(
    () => ({
      uri: `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1&controls=1`,
      headers: {
        Referer: 'https://awakeningclasses.in/',
      },
    }),
    [id]
  );

  const handleNav = (request: WebViewNavigation) => {
    const url = request.url || '';
    if (url.includes(`/embed/${id}`)) return true;
    if (isShareUrl(url)) {
      onShare?.({ url });
      return false;
    }
    return true;
  };

  return (
    <View style={{ width, height, backgroundColor: '#000' }}>
      <WebView
        key={id}
        source={source}
        style={styles.web}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        allowsFullscreenVideo
        bounces={false}
        scrollEnabled={false}
        setSupportMultipleWindows={false}
        originWhitelist={['*']}
        mixedContentMode="always"
        androidLayerType="hardware"
        userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"
        injectedJavaScriptBeforeContentLoaded={SHARE_SCRIPT}
        injectedJavaScript={SHARE_SCRIPT}
        onMessage={(event) => {
          try {
            const payload = JSON.parse(event.nativeEvent.data);
            if (payload?.type === 'share') onShare?.(payload);
          } catch {
            // ignore
          }
        }}
        onShouldStartLoadWithRequest={handleNav}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  web: {
    flex: 1,
    backgroundColor: '#000',
    opacity: 0.99,
  },
});
