#!/usr/bin/env python3
"""Publish a Happyish Insight via its dedicated image upload and article endpoints."""
import argparse,base64,json,os,sys,urllib.request
from pathlib import Path

def call(url,token,payload):
 request=urllib.request.Request(url,data=json.dumps(payload).encode(),headers={'Content-Type':'application/json','x-hermes-publish-token':token},method='POST')
 with urllib.request.urlopen(request,timeout=60) as response:return json.load(response)

def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('article',type=Path);parser.add_argument('--check',action='store_true',help='Validate locally without uploading or publishing');args=parser.parse_args()
 payload=json.loads(args.article.read_text());required=('slug','title','excerpt','body_markdown','category_slug','cover_image_file','cover_image_alt','sources','tile_colour')
 missing=[k for k in required if not payload.get(k)]
 if missing:raise ValueError('Missing: '+', '.join(missing))
 import re
 if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',payload['slug']) or len(payload['slug'])>120:raise ValueError('Invalid slug')
 if payload['tile_colour'] not in ('yellow','coral','teal','ink'):raise ValueError('Invalid tile colour')
 image=Path(payload.pop('cover_image_file')).expanduser()
 if not image.is_absolute():image=args.article.resolve().parent/image
 data=image.read_bytes()
 if data.startswith(b'\x89PNG\r\n\x1a\n'):mime='image/png'
 elif data.startswith(b'\xff\xd8\xff'):mime='image/jpeg'
 elif data[:4]==b'RIFF' and data[8:12]==b'WEBP':mime='image/webp'
 else:raise ValueError('cover_image_file must be an actual PNG, JPEG or WebP image')
 if len(data)>10*1024*1024:raise ValueError('Image exceeds 10 MB')
 if args.check:print('Article and image validated locally; nothing uploaded or published.');return
 token=os.environ.get('HAPPYISH_PUBLISH_TOKEN')
 if not token:
  token_file=Path(__file__).resolve().parents[1]/'.private/publish-token'
  token=token_file.read_text().strip() if token_file.exists() else ''
 if not token:raise ValueError('HAPPYISH_PUBLISH_TOKEN is required')
 base=os.environ.get('HAPPYISH_SUPABASE_URL','https://wewucfgrtxpolxlxmitq.supabase.co')+'/functions/v1/'
 uploaded=call(base+'happyish-upload-insight-image',token,{'slug':payload['slug'],'mime_type':mime,'image_base64':base64.b64encode(data).decode()})
 payload['cover_image_path']=uploaded['public_url']
 result=call(base+'happyish-publish-insight',token,payload)
 print(json.dumps({k:result.get(k) for k in ('ok','slug','public_url')},indent=2))
if __name__=='__main__':
 try:main()
 except Exception as error:print('Publication failed: '+str(error),file=sys.stderr);sys.exit(1)
