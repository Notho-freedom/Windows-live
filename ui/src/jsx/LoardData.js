import React, { useMemo } from 'react';

function importAll(r) {
  const images = {};
  r.keys().forEach((item) => {
    images[item.replace('./', '')] = r(item);
  });
  return images;
}

const images = importAll(require.context('../assets/', false, /\.(png|jpe?g|svg)$/));
const imagesX = importAll(require.context('../assets/futures/', false, /\.(png|jpe?g|svg)$/));
const imagesSvgPlus = importAll(require.context('../assets/icons/icons/', false, /\.(png|jpe?g|svg)$/));

const findIcon = (name, size, sources) => {
  for (const src of sources) {
    if (src[name]) {
      return <img src={src[name]} alt={name} className={`w-${size} h-${size}`} />;
    }
  }
  return null;
};

export const makeName3 = (name, size = 7) => {
  return findIcon(name, size, [imagesSvgPlus]) || null;
};

export const makeName = (name, size = 7) => {
  const fname = `icons8-${name}-48.png`;
  return findIcon(fname, size, [images]) || null;
};

export const makeName2 = (name, size = 7) => {
  const fname = `Arrioch-Senary-${name}.48.png`;
  return findIcon(fname, size, [imagesX]) || null;
};


export const GetIcon = React.memo(({ item, size = 7 }) => {
  const iconConfig = useMemo(() => ({
    folder: makeName2('Folder-live-folder', size),
    folder_empty: makeName2('Folder-live-folder', size),
    jpg: makeName2('Picture-jpg', size),
    png: makeName('picture', size),
    torrent: makeName('torrent', size),
    gif: makeName('Picture-gif', size),
    zip: makeName2('Archive-zip', size),
    rar: makeName2('Archive-rar', size),
    cab: makeName2('Archive-cab', size),
    txt: makeName2('Misc-file-txt', size),
    log: makeName2('Misc-file-txt', size),
    pdf: makeName2('Misc-acrobat-pdf', size),
    ini: makeName2('Misc-file-ini', size),
    dll: makeName2('Misc-file-dll', size),
    exe: makeName2('Misc-file-exe', size),
    html: makeName2('Internet-html', size),
    inf: makeName2('Misc-file-inf', size),
    xml: makeName2('Internet-xml', size),
    mp3: makeName2('Media-music-mp-3', size),
    mp4: makeName2('Media-video-mp-4', size),
    avi: makeName2('Media-video-avi', size),
    mpg: makeName2('Media-video-mpg', size),
    mkv: makeName2('Media-video-mkv', size),
    wav: makeName2('Media-music-wav', size),
    ogg: makeName2('Media-music-ogg', size),
    midi: makeName2('Media-music-midi', size),
    directory_hidden: <img src={imagesX['Arrioch-Senary-Folder-live-folder.48.png']} alt="" className={`w-${size} h-${size} opacity-50`} />,
    trash: makeName2('System-trash-v2-full', size),
    desktop: makeName2('System-desktop', size),
    default: makeName2('Misc-default-file', size),
  }), [size]);

  const icon = useMemo(() => {
    const { type, name, is_hidden, size: itemSize } = item;

    if (type === 'directory') {
      if (is_hidden) {
        return iconConfig.directory_hidden;
      }
      return itemSize === 0 ? iconConfig.folder : iconConfig.folder_empty;
    }

    if (type === 'default') {
      return item.path.includes('C:\\$Recycle.Bin')? iconConfig.trash: iconConfig.desktop;
    }

    const extension = name.split('.').pop().toLowerCase();

    const configIcon = iconConfig[extension];
    if (configIcon) {
      return is_hidden
        ? React.cloneElement(configIcon, { className: 'opacity-50' })
        : configIcon;
    }

    const fallbackIcon = makeName3(`${extension}.svg`);
    if (fallbackIcon) {
      return is_hidden
        ? React.cloneElement(fallbackIcon, { className: 'opacity-50' })
        : fallbackIcon;
    }

    return iconConfig.default;
  }, [item, iconConfig]);

  return icon;
});


export const displayConfig = {
    'grid': {
      container: 'content-start grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full ',
      item: 'text-white p-1',
    },
    'list': {
      container: 'content-start flex flex-col space-y-4 w-full',
      item: 'text-white p-1 w-full',
    },
    'columns': {
      container: 'content-start w-full',
      item: '',
    },
  };

  