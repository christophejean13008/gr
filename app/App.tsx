/**
 * GR Star — application Android
 * Une simple WebView plein écran qui ouvre le jeu en ligne.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Linking,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import type {
  AndroidWebViewProps,
  ShouldStartLoadRequest,
} from 'react-native-webview/lib/WebViewTypes';

/* typage simplifié (les types de la bibliothèque ne passent pas avec TypeScript 6) */
const Vue = WebView as unknown as React.ComponentType<
  AndroidWebViewProps & { ref?: React.Ref<WebView> }
>;

/** Adresse du jeu (directement, sans passer par la redirection de grstar.fr) */
const URL_JEU = 'https://christophejean13008.github.io/gr/gr.html';

/** Sites qui restent dans l'application ; tout autre lien s'ouvre dans le navigateur */
const HOTES_INTERNES = [
  'christophejean13008.github.io',
  'grstar.fr',
  'www.grstar.fr',
];

const FOND = '#12081f';

function estInterne(url: string): boolean {
  if (/^(about:|blob:|data:|javascript:)/i.test(url)) return true;
  const m = url.match(/^https?:\/\/([^/:?#]+)/i);
  return !!m && HOTES_INTERNES.includes(m[1].toLowerCase());
}

export default function App() {
  const web = useRef<WebView>(null);
  const peutRevenir = useRef(false);
  const [erreur, setErreur] = useState(false);
  const [cle, setCle] = useState(0);

  // Bouton « retour » d'Android : page précédente dans le jeu, sinon on quitte
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (peutRevenir.current && web.current) {
        web.current.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, []);

  const filtrer = useCallback((req: ShouldStartLoadRequest) => {
    if (estInterne(req.url)) return true;
    Linking.openURL(req.url).catch(() => {});
    return false;
  }, []);

  const recharger = () => {
    setErreur(false);
    setCle(k => k + 1);
  };

  return (
    <View style={styles.fond}>
      <StatusBar hidden barStyle="light-content" />
      {erreur ? (
        <View style={styles.erreur}>
          <Text style={styles.titre}>🎀 GR Star</Text>
          <Text style={styles.texte}>
            Pas de connexion Internet.{'\n'}Vérifie ton Wi-Fi ou tes données
            mobiles.
          </Text>
          <Pressable style={styles.bouton} onPress={recharger}>
            <Text style={styles.boutonTexte}>Réessayer</Text>
          </Pressable>
        </View>
      ) : (
        <Vue
          key={cle}
          ref={web}
          source={{ uri: URL_JEU }}
          style={styles.fond}
          containerStyle={styles.fond}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          cacheEnabled
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo
          allowFileAccess
          setSupportMultipleWindows={false}
          overScrollMode="never"
          textZoom={100}
          applicationNameForUserAgent="GRStarApp/1.0"
          onShouldStartLoadWithRequest={filtrer}
          onNavigationStateChange={n => {
            peutRevenir.current = n.canGoBack;
          }}
          onError={() => setErreur(true)}
          onHttpError={e => {
            if (
              e.nativeEvent.url === URL_JEU &&
              e.nativeEvent.statusCode >= 500
            )
              setErreur(true);
          }}
          onRenderProcessGone={() => recharger()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fond: { flex: 1, backgroundColor: FOND },
  erreur: {
    flex: 1,
    backgroundColor: FOND,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  titre: { color: '#fff', fontSize: 34, fontWeight: '800', marginBottom: 16 },
  texte: {
    color: '#e6d9ff',
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  bouton: {
    backgroundColor: '#ff4fa3',
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  boutonTexte: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
