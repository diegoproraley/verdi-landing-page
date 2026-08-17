"""
Fotos grandes da landing page (topo, seção "A Verdi" e faixa final).
As miniaturas dos itens do cardápio ficam em preparar_itens.py.
Reexecute sempre que trocar uma foto de origem.
"""
import os
from PIL import Image, ImageEnhance

ORIGEM = '/mnt/user-data/uploads'
DESTINO = '../img'

U = {
    'salada_pote':   'WhatsApp_Image_2026-08-15_at_19_51_28.jpeg',
    'blend_maracuja':'WhatsApp_Image_2026-08-15_at_19_51_29__1_.jpeg',
    'blend_abacaxi': 'WhatsApp_Image_2026-08-15_at_19_51_29__2_.jpeg',
    'blend_pitaya':  'WhatsApp_Image_2026-08-15_at_19_51_29__3_.jpeg',
    'legumes_cubos': 'WhatsApp_Image_2026-08-15_at_19_51_29__4_.jpeg',
    'inhame':        'WhatsApp_Image_2026-08-15_at_19_51_29__5_.jpeg',
    'cenoura_pim':   'WhatsApp_Image_2026-08-15_at_19_51_29__6_.jpeg',
    'mix_refogado':  'WhatsApp_Image_2026-08-15_at_19_51_29__7_.jpeg',
    'julienne':      'WhatsApp_Image_2026-08-15_at_19_51_29__8_.jpeg',
    'folhas':        'WhatsApp_Image_2026-08-15_at_19_51_29.jpeg',
}

# saida, origem, largura, altura, foco vertical (0 = topo, 1 = base), foco horizontal
CORTES = [
    ('hero-salada.jpg',   'salada_pote', 1000, 1250, 0.52, 0.50),
    ('hero-blend.jpg',    'blend_pitaya', 800,  800, 0.58, 0.50),
    ('sobre-bancada.jpg', 'cenoura_pim', 1200, 1000, 0.50, 0.50),
    ('faixa-entrega.jpg', 'folhas',      1600,  900, 0.58, 0.50),
]


def recortar(caminho, larg, alt, fy, fx):
    im = Image.open(caminho).convert('RGB')
    W, H = im.size
    alvo = larg / alt

    if W / H > alvo:                     # sobra largura
        nova_l = int(H * alvo)
        x = int((W - nova_l) * fx)
        caixa = (x, 0, x + nova_l, H)
    else:                                # sobra altura
        nova_a = int(W / alvo)
        y = int((H - nova_a) * fy)
        caixa = (0, y, W, y + nova_a)

    im = im.crop(caixa).resize((larg, alt), Image.LANCZOS)
    im = ImageEnhance.Color(im).enhance(1.05)      # frescor sem exagero
    im = ImageEnhance.Contrast(im).enhance(1.03)
    return im


os.makedirs(DESTINO, exist_ok=True)
for saida, chave, larg, alt, fy, fx in CORTES:
    origem = os.path.join(ORIGEM, U[chave])
    img = recortar(origem, larg, alt, fy, fx)
    destino = os.path.join(DESTINO, saida)
    img.save(destino, 'JPEG', quality=82, optimize=True, progressive=True)

    # versão leve para celular (metade da largura), usada via srcset
    pequena = img.resize((larg // 2, alt // 2), Image.LANCZOS)
    destino_sm = destino.replace('.jpg', '-sm.jpg')
    pequena.save(destino_sm, 'JPEG', quality=78, optimize=True, progressive=True)

    print(f'{saida:26s} {larg}x{alt}  {os.path.getsize(destino)//1024} KB'
          f'   + sm {larg//2}x{alt//2}  {os.path.getsize(destino_sm)//1024} KB')
