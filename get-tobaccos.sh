#!/bin/bash
set -e

# Directory for output
mkdir -p ./data/csv

# Cookie jar file for session management
COOKIE_JAR="/tmp/tobacco_cookies.txt"
rm -f "$COOKIE_JAR"

# Common curl options
COMMON_CURL_OPTS=(
  -s
  -L
  -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
  -H 'Accept-Language: es,en-GB;q=0.9,en;q=0.8,fr;q=0.7'
  -H 'Cache-Control: max-age=0'
  -H 'Connection: keep-alive'
  -H 'Content-Type: application/x-www-form-urlencoded'
  -H 'DNT: 1'
  -H 'Origin: https://www.hacienda.gob.es'
  -H 'Referer: https://www.hacienda.gob.es/es-ES/Areas%20Tematicas/CMTabacos/Paginas/PreciosLabores.aspx'
  -H 'Sec-Fetch-Dest: document'
  -H 'Sec-Fetch-Mode: navigate'
  -H 'Sec-Fetch-Site: same-origin'
  -H 'Sec-Fetch-User: ?1'
  -H 'Upgrade-Insecure-Requests: 1'
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'
  -H 'sec-ch-ua: "Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"'
  -H 'sec-ch-ua-mobile: ?0'
  -H 'sec-ch-ua-platform: "macOS"'
)

URL='https://www.hacienda.gob.es/es-ES/Areas%20Tematicas/CMTabacos/Paginas/PreciosLabores.aspx'

echo "[1/5] Visiting initial page to establish session..."
curl -s -o /dev/null \
  -c "$COOKIE_JAR" \
  "${COMMON_CURL_OPTS[@]}" \
  "$URL"

echo "[2/5] Searching Peninsula e Illes Balears..."
curl -s -o /dev/null \
  -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
  "${COMMON_CURL_OPTS[@]}" \
  --data-raw '_wpcmWpid=&wpcmVal=&__EVENTTARGET=&__EVENTARGUMENT=&MSOWebPartPage_PostbackSource=&MSOTlPn_SelectedWpId=&MSOTlPn_View=0&MSOTlPn_ShowSettings=False&MSOGallery_SelectedLibrary=&MSOGallery_FilterString=&MSOTlPn_Button=none&__REQUESTDIGEST=noDigest&MSOSPWebPartManager_DisplayModeName=Browse&MSOSPWebPartManager_ExitingDesignMode=false&MSOWebPartPage_Shared=&MSOLayout_LayoutChanges=&MSOLayout_InDesignMode=&_wpSelected=&_wzSelected=&MSOSPWebPartManager_OldDisplayModeName=Browse&MSOSPWebPartManager_StartWebPartEditingName=false&MSOSPWebPartManager_EndWebPartEditing=false&__LASTFOCUS=&buscador=&idioma=%2Fes-ES%2FAreas%2520Tematicas%2FCMTabacos%2FPaginas%2FPreciosLabores.aspx&MinPortalTabacosZona=Pen%C3%ADnsula+e+Illes+Balears&Mostrar=&MinPortalTabacosLabor=Picadura+de+pipa&MinPortalTabacosMarca=&filtrar=Consultar+precios&PageIndex=0' \
  "$URL"

echo "[3/5] Downloading pb.csv (Peninsula e Illes Balears)..."
curl -s \
  -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
  "${COMMON_CURL_OPTS[@]}" \
  --data-raw '_wpcmWpid=&wpcmVal=&__EVENTTARGET=&__EVENTARGUMENT=&MSOWebPartPage_PostbackSource=&MSOTlPn_SelectedWpId=&MSOTlPn_View=0&MSOTlPn_ShowSettings=False&MSOGallery_SelectedLibrary=&MSOGallery_FilterString=&MSOTlPn_Button=none&__REQUESTDIGEST=noDigest&MSOSPWebPartManager_DisplayModeName=Browse&MSOSPWebPartManager_ExitingDesignMode=false&MSOWebPartPage_Shared=&MSOLayout_LayoutChanges=&MSOLayout_InDesignMode=&_wpSelected=&_wzSelected=&MSOSPWebPartManager_OldDisplayModeName=Browse&MSOSPWebPartManager_StartWebPartEditingName=false&MSOSPWebPartManager_EndWebPartEditing=false&__LASTFOCUS=&buscador=&idioma=%2Fes-ES%2FAreas%2520Tematicas%2FCMTabacos%2FPaginas%2FPreciosLabores.aspx&MinPortalTabacosZona=Pen%C3%ADnsula+e+Illes+Balears&Mostrar=&MinPortalTabacosLabor=Picadura+de+pipa&MinPortalTabacosMarca=&exportToCsv=Exportar+a+CSV&PageIndex=0' \
  "$URL" > './data/csv/pb.csv'

echo "[4/5] Searching Ceuta y Melilla..."
curl -s -o /dev/null \
  -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
  "${COMMON_CURL_OPTS[@]}" \
  --data-raw '_wpcmWpid=&wpcmVal=&__EVENTTARGET=&__EVENTARGUMENT=&MSOWebPartPage_PostbackSource=&MSOTlPn_SelectedWpId=&MSOTlPn_View=0&MSOTlPn_ShowSettings=False&MSOGallery_SelectedLibrary=&MSOGallery_FilterString=&MSOTlPn_Button=none&__REQUESTDIGEST=noDigest&MSOSPWebPartManager_DisplayModeName=Browse&MSOSPWebPartManager_ExitingDesignMode=false&MSOWebPartPage_Shared=&MSOLayout_LayoutChanges=&MSOLayout_InDesignMode=&_wpSelected=&_wzSelected=&MSOSPWebPartManager_OldDisplayModeName=Browse&MSOSPWebPartManager_StartWebPartEditingName=false&MSOSPWebPartManager_EndWebPartEditing=false&__LASTFOCUS=&buscador=&idioma=%2Fes-ES%2FAreas%2520Tematicas%2FCMTabacos%2FPaginas%2FPreciosLabores.aspx&MinPortalTabacosZona=Ceuta+y+Melilla&Mostrar=&MinPortalTabacosLabor=Picadura+de+pipa&MinPortalTabacosMarca=&filtrar=Consultar+precios&PageIndex=0' \
  "$URL"

echo "[5/5] Downloading cm.csv (Ceuta y Melilla)..."
curl -s \
  -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
  "${COMMON_CURL_OPTS[@]}" \
  --data-raw '_wpcmWpid=&wpcmVal=&__EVENTTARGET=&__EVENTARGUMENT=&MSOWebPartPage_PostbackSource=&MSOTlPn_SelectedWpId=&MSOTlPn_View=0&MSOTlPn_ShowSettings=False&MSOGallery_SelectedLibrary=&MSOGallery_FilterString=&MSOTlPn_Button=none&__REQUESTDIGEST=noDigest&MSOSPWebPartManager_DisplayModeName=Browse&MSOSPWebPartManager_ExitingDesignMode=false&MSOWebPartPage_Shared=&MSOLayout_LayoutChanges=&MSOLayout_InDesignMode=&_wpSelected=&_wzSelected=&MSOSPWebPartManager_OldDisplayModeName=Browse&MSOSPWebPartManager_StartWebPartEditingName=false&MSOSPWebPartManager_EndWebPartEditing=false&__LASTFOCUS=&buscador=&idioma=%2Fes-ES%2FAreas%2520Tematicas%2FCMTabacos%2FPaginas%2FPreciosLabores.aspx&MinPortalTabacosZona=Ceuta+y+Melilla&Mostrar=&MinPortalTabacosLabor=Picadura+de+pipa&MinPortalTabacosMarca=&exportToCsv=Exportar+a+CSV&PageIndex=0' \
  "$URL" > './data/csv/cm.csv'

# Verify downloads
if [ -s './data/csv/pb.csv' ] && [ -s './data/csv/cm.csv' ]; then
  echo "✓ Downloads complete."
  echo "  - data/csv/pb.csv: $(wc -c < './data/csv/pb.csv') bytes"
  echo "  - data/csv/cm.csv: $(wc -c < './data/csv/cm.csv') bytes"
else
  echo "✗ Download failed - one or both files are empty"
  exit 1
fi
