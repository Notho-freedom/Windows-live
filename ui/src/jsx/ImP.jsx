import React, { useMemo, useState, useEffect } from "react";

// Fonction utilitaire pour importer tous les fichiers dans un répertoire
function importAll(r) {
  return r.keys().reduce((images, key) => {
    images[key.replace("./", "")] = r(key);
    return images;
  }, {});
}

// Importation des packs d'icônes
const defaultPackIcons = importAll(require.context("../assets/default/", false, /\.(png|jpe?g|svg)$/));
const futurePackIcons = importAll(require.context("../assets/futures/futures/", false, /\.(png|jpe?g|svg)$/));
const svgPackIcons = importAll(require.context("../assets/icons/", false, /\.(png|jpe?g|svg)$/));

// Résolution d'une icône par type ou extension
const findIcon = ({ type, path }) => {
  const name = path.split("/").pop();
  const extension = type === "file" ? name.split(".").pop().toLowerCase() : null;

  if (extension && svgPackIcons[`${extension}.svg`]) {
    return svgPackIcons[`${extension}.svg`];
  }
  if (svgPackIcons[`${name}.svg`]) {
    return svgPackIcons[`${name}.svg`];
  }
  return null;
};

// Configuration des packs d'icônes
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
      db: "db",
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
      xlsx: "xlsx",
      zip: "zip",
      rar: "rar",
      exe: "exe",
      dll: "dll",
      css: "css",
      csv: "csv",
      iso: "iso",
      php: "php",
      reg: "reg",
      ttf: "ttf",
      xls: "xls",
      default: "file",
    },
    types: {
      folder: "Folder",
      desktop: "Desktop",
      trash: "trash",
      drive: "Drive",
      music: "Fmusics",
      pictures: "Fpictures",
      videos: "Fvideos",
      downloads: "Fdownloads",
      documents: "Fdoc",
      default: "fileOpen",
    },
    icons: futurePackIcons,
  },
  default: {
    extensions: { default: "file" },
    types: { default: "unknown" },
    icons: defaultPackIcons,
  },
  svg: {
    extensions: { default: "file" },
    types: { default: "unknown" },
    icons: svgPackIcons,
  },
};

// Gestion de cache global pour les icônes externes
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

// Composant principal pour gérer les icônes
export const IconManager = ({
  pack = "future",
  type,
  extension,
  state = "normal",
  size = 3,
  externalIconUrl = null,
  item,
}) => {
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
        ? selectedPack.extensions[extension] || findIcon(item) || selectedPack.extensions.default
        : selectedPack.types[type] || findIcon(item) || selectedPack.types.default;

    return (
      selectedPack.icons?.[`${resolvedKey}.png`] ||
      selectedPack.icons?.[`${resolvedKey}.svg`] ||
      iconPacks.default.icons["fallback.png"]
    );
  }, [pack, type, extension, externalIcon, item]);

  return icon ? (
    <img
      src={icon}
      alt={`${type || extension}-icon`}
      style={{ width: `${size}em`, height: `${size}em`, opacity: state === "hidden" ? 0.5 : 1 }}
    />
  ) : null;
};

// Récupérer une icône basée sur un item
export const GetIcon = ({ item, size = 3, pack = "future" }) => {
  const { type, path, is_hidden } = item;
  const extension = type === "file" ? path.split(".").pop().toLowerCase() : null;

  return (
    <IconManager
      pack={pack}
      type={type}
      extension={extension}
      state={is_hidden ? "hidden" : "normal"}
      size={size}
      item={item}
    />
  );
};
