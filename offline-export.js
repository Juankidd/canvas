/* Canvas Studio exportador sin dependencias externas: Canvas API + PDF JPEG embebido. */
(function () {
  'use strict';
  const W = 1600, H = 1180;
  const positions = {
    partners:[0,0,2,2],activities:[2,0,2,1],resources:[2,1,2,1],value:[4,0,2,2],relationships:[6,0,2,1],channels:[6,1,2,1],customers:[8,0,2,2],costs:[0,2,5,1],revenue:[5,2,5,1]
  };
  const canvas = () => { const c=document.createElement('canvas');c.width=W;c.height=H;return c; };
  function rounded(c,x,y,w,h,r,fill,stroke) {
    c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}
  }
  function lineText(c, text, x,y,maxWidth,lineHeight,maxLines, font, color) {
    c.font=font;c.fillStyle=color;c.textBaseline='top';
    let words=String(text).split(/\s+/), lines=[], line='';
    for(const word of words){
      let trial=line?line+' '+word:word;
      if(c.measureText(trial).width<=maxWidth){line=trial;continue;}
      if(line){lines.push(line);line='';}
      if(c.measureText(word).width>maxWidth){let part='';for(const ch of word){if(c.measureText(part+ch).width>maxWidth&&part){lines.push(part);part='';}part+=ch;}line=part;}
      else line=word;
    }
    if(line)lines.push(line);
    const visible=lines.slice(0,maxLines||1000);
    visible.forEach((t,i)=>c.fillText(t,x,y+i*lineHeight));
    return visible.length*lineHeight;
  }
  // Logo embebido, no se dibuja desde un recurso file:// ni de otro origen.
  // Esto evita que el navegador marque el lienzo como contaminado.
  const LOGO_DATA = 'data:image/png;base64,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';
  let logoPromise;
  function getLogo(){
    if(!logoPromise) logoPromise = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = LOGO_DATA;
    });
    return logoPromise;
  }
  function drawLogo(c,x,y,logo){
    if(logo && logo.naturalWidth) {
      c.drawImage(logo,x,y,112,46);
    } else {
      c.font='bold 44px Arial';c.fillStyle='#db1924';c.fillText('uao',x,y);
    }
  }
  function drawCanvas(model,definitions,logo){
    const cv=canvas(), c=cv.getContext('2d');c.fillStyle='#f6f8fc';c.fillRect(0,0,W,H);
    rounded(c,32,25,1536,132,16,'#ffffff','#e7ebf2');
    lineText(c,model.name||'Business Model Canvas',58,49,1260,38,2,'bold 32px Arial','#26324a');
    lineText(c,`BUSINESS MODEL CANVAS   |   ${model.date||''}`,59,95,1200,20,1,'15px Arial','#728098');
    const authors=(model.authors||[]).filter(x=>x&&x.trim());
    if(authors.length) lineText(c,'Autores: '+authors.join('  ·  '),59,116,1330,17,2,'14px Arial','#59677f');
    drawLogo(c,1422,52,logo);
    const gx=32,gy=175,gw=1536,gh=945,gap=10,cw=(gw-gap*4)/5,rh=(gh-gap*2)/3;
    for(const d of definitions){
      const [col,row,spanX,spanY]=positions[d.id];
      const x=gx+col*(cw/2+gap/2), y=gy+row*(rh+gap);
      const w=spanX===5?(gw-gap)/2:spanX*(cw/2+gap/2)-gap;
      const h=spanY*rh+(spanY-1)*gap;
      rounded(c,x,y,w,h,12,'#fff','#e2e7f0');
      c.fillStyle=d.color;c.fillRect(x+2,y+2,w-4,7);
      lineText(c,d.title,x+15,y+26,w-28,26,2,'bold 19px Arial',d.color);
      lineText(c,d.desc,x+15,y+59,w-28,18,2,'13px Arial','#8592a5');
      let yy=y+101;
      const values=model.blocks[d.id]||[];
      if(!values.length)lineText(c,'Sin ideas registradas',x+15,yy,w-30,17,2,'italic 14px Arial','#9ba7b5');
      for(let i=0;i<values.length;i++){
        const remaining=y+h-32-yy;if(remaining<45)break;
        const words=values[i];
        const maxLines=Math.min(3,Math.floor((remaining-9)/18));
        c.font='14px Arial';
        const hh=Math.min(100,16+Math.min(maxLines,Math.ceil(c.measureText(words).width/(w-58)))*18);
        rounded(c,x+13,yy,w-26,hh,6,d.tint);
        lineText(c,'• '+words,x+22,yy+9,w-45,18,maxLines,'14px Arial','#344155');
        yy+=hh+8;
      }
      if(values.length>0){lineText(c,`${values.length} idea(s) en este bloque`,x+15,y+h-24,w-30,15,1,'11px Arial','#8491a3');}
    }
    return cv;
  }
  window.exportOffline=async function(type,model,definitions,filename,downloadBlob,toast){
    const logo=await getLogo();
    const cv=drawCanvas(model,definitions,logo);
    const blob=await new Promise(resolve=>cv.toBlob(resolve,'image/png'));
    if(!blob)throw Error('No fue posible generar la imagen PNG');
    downloadBlob(blob,filename('png'));
    toast('Imagen PNG descargada');
  };
})();
