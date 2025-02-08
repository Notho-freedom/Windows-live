import React, { useMemo, useState, useEffect } from "react";

function importAll(r) {
  return r.keys().reduce((images, key) => {
    images[key.replace("./", "")] = r(key);
    return images;
  }, {});
}

const defaultPackIcons = importAll(require.context("../assets/default/", false, /\.(png|jpe?g|svg)$/));
const futurePackIcons = importAll(require.context("../assets/futures/futures/", false, /\.(png|jpe?g|svg)$/));
const svgPackIcons = importAll(require.context("../assets/icons/", false, /\.(png|jpe?g|svg)$/));

const iconPacks = {
  future: {
extensions: {
  jpg: "jpg",
  png: "png",
  gif: "gif",
  jpeg: "jpg",
  bmp: "bmp",
  tiff: "tiff",
  torrent: "torrent",
  db:"db",

  avi: "avi",
  mkv: "mkv",
  mp4: "mp4",
  mpg: "mpg",

  mp3: "mp3",
  wav: "wav",
  ogg: "ogg",
  midi: "midi",

  txt: "txt",
  log: "txt",
  pdf: "pdf",
  html: "html",
  xml: "xml",
  js: "js",
  doc: "doc",
  docx: "docx",
  ppt: "ppt",
  pptx: "pptx",
  pps: "pps",
  ppsx: "ppsx",
  xlsx: "xlsx",

  zip: "zip",
  rar: "rar",
  cab: "cab",
  '7z': "7z",

  exe: "exe",
  dll: "dll",
  sys: "sys",
  ini: "ini",
  inf: "inf",

  css: "css",
  csv: "csv",
  iso: "iso",
  php: "php",
  reg: "reg",
  rm: "rm",
  ttf: "ttf",
  xls: "xls",

  default: "file",
}
,
    types: {
      directory: "Folder",
      desktop: "Desktop",
      cepc: "Ce PC",
      trash: "trash",
      trashFull: "trashFull",
      drive: "Drive",
      driveCD: "DriveCD",
      winDrive: "WinDrive",
      network: "Network",
      router: "Router",
      musics: "Fmusics",
      pictures: "Fpictures",
      videos: "Fvideos",
      downloads: "Fdownloads",
      documents: "Fdoc",
      objects: "3dObjects",
      default: "fileOpen",
      Router: "Router",
      router2: "router2",
      trash0: "trash0",
      trash0Full: "trash0Full",
      Network: "Network",
      avatar: "avatar",
      favourites: "favourites",
    },
    icons: futurePackIcons,
  },
  default: {
    extensions: {
      default: "file",
    },
    types: {
      default: "unknown",
    },
    icons: defaultPackIcons,
  },
  svg: {
    extensions: {
      default: "file",
    },
    types: {
      default: "unknown",
    },
    icons: svgPackIcons,
  },
};

const globalIconStates = {
  hidden: { opacity: 0.5 },
  normal: { opacity: 1 },
};

const globalIconCache = new Map();

const fetchExternalIcon = async (url) => {
  if (globalIconCache.has(url)) return globalIconCache.get(url);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erreur de chargement de l'icône externe : ${url}`);
    const blob = await response.blob();
    const objectURL = URL.createObjectURL(blob);
    globalIconCache.set(url, objectURL);
    return objectURL;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const IconManager = ({ pack = "future", type, extension, state = "normal", size = 3, externalIconUrl = null }) => {
  const [externalIcon, setExternalIcon] = useState(null);

  useEffect(() => {
    if (externalIconUrl) {
      fetchExternalIcon(externalIconUrl).then(setExternalIcon);
    }
  }, [externalIconUrl]);

  const icon = useMemo(() => {
    if (externalIcon) return externalIcon;

    const selectedPack = iconPacks[pack] || iconPacks.future;
    const resolvedKey =
      type === "file"
        ? selectedPack.extensions[extension] || selectedPack.extensions.default
        : selectedPack.types[type] || selectedPack.types.default;

    return (
      selectedPack.icons?.[`${resolvedKey}.png`] ||
      selectedPack.icons?.[`${resolvedKey}.svg`] ||
      iconPacks.default.icons["fallback.png"]
    );
  }, [pack, type, extension, externalIcon]);

  const stateStyle = useMemo(() => globalIconStates[state] || {}, [state]);

  return icon ? (
    <img
      src={icon}
      alt={`${type || extension}-icon`}
      className={`w-[${size}em] h-[${size}em]`}
      style={stateStyle}
    />
  ) : null;
};

export const GetIcon = ({ item, size=3, pack = "future" }) => {
  const { type, path, is_hidden } = item;
  const extension = type === "file" ? path.split(".").pop().toLowerCase() : null;
  return (
    <IconManager
      pack={pack}
      type={type}
      extension={extension}
      state={is_hidden ? "hidden" : "normal"}
      size={size}
    />
  );
};
