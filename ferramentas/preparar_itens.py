"""
Miniaturas quadradas dos itens do cardápio da Verdi.
Uma foto por item, 260px, para as linhas da lista de produtos.
"""
import os
from PIL import Image, ImageEnhance

ORIGEM = '/mnt/user-data/uploads'
DESTINO = '../img'
LADO = 260

# item do cardápio -> arquivo de origem -> foco vertical do corte
ITENS = [
    ('salada-tradicional',      'WhatsApp_Image_2026-08-15_at_19_51_28.jpeg',      0.52),
    ('mix-3-cores',             'WhatsApp_Image_2026-08-15_at_19_51_29__8_.jpeg',  0.50),
    ('alface-crespa',           'WhatsApp_Image_2026-08-15_at_20_27_35__6_.jpeg',  0.52),
    ('kit-yakisoba',            'WhatsApp_Image_2026-08-15_at_19_51_29__7_.jpeg',  0.52),
    ('kit-arroz-grega',         'WhatsApp_Image_2026-08-15_at_19_51_29__6_.jpeg',  0.50),
    ('batata-doce',             'WhatsApp_Image_2026-08-15_at_19_51_29__5_.jpeg',  0.52),
    ('kit-forno',               'WhatsApp_Image_2026-08-15_at_19_51_29__4_.jpeg',  0.52),
    ('kit-sopinha',             'WhatsApp_Image_2026-08-15_at_20_27_34__6_.jpeg',  0.50),
    ('vinagrete',               'WhatsApp_Image_2026-08-15_at_20_27_34__5_.jpeg',  0.50),
    ('blend-manga-abacaxi-maracuja',        'WhatsApp_Image_2026-08-15_at_20_27_31.jpeg',     0.58),
    ('blend-abacaxi-couve-hortela-gengibre','WhatsApp_Image_2026-08-15_at_20_27_31__2_.jpeg', 0.55),
    ('blend-abacaxi-morango',              'WhatsApp_Image_2026-08-15_at_20_27_31__3_.jpeg',  0.55),
    ('blend-abacaxi-morango-maracuja',     'WhatsApp_Image_2026-08-15_at_20_27_31__4_.jpeg',  0.58),
    ('blend-mamao-maca-banana',            'WhatsApp_Image_2026-08-15_at_20_27_33.jpeg',      0.50),
    ('blend-mamao-morango-maca',           'WhatsApp_Image_2026-08-15_at_20_27_34__1_.jpeg',  0.55),
    ('blend-abacate-banana',               'WhatsApp_Image_2026-08-15_at_20_27_34__2_.jpeg',  0.52),
    ('blend-abacate-banana-chia',          'WhatsApp_Image_2026-08-15_at_20_27_34__3_.jpeg',  0.52),
    ('abobrinha',               'WhatsApp_Image_2026-08-15_at_20_27_34__8_.jpeg',  0.50),
    ('repolho-verde',           'WhatsApp_Image_2026-08-15_at_20_27_34__9_.jpeg',  0.50),
    ('mix-repolho-cenoura',     'WhatsApp_Image_2026-08-15_at_20_27_34__10_.jpeg', 0.50),
    ('cenoura-ralada',          'WhatsApp_Image_2026-08-15_at_20_27_34__11_.jpeg', 0.50),
    ('beterraba',               'WhatsApp_Image_2026-08-15_at_20_27_34__12_.jpeg', 0.50),
    ('salada-gourmet',          'WhatsApp_Image_2026-08-15_at_20_27_34__13_.jpeg', 0.50),
    ('salada-mista',            'WhatsApp_Image_2026-08-15_at_20_27_34__14_.jpeg', 0.50),
    ('salada-colorida',         'WhatsApp_Image_2026-08-15_at_20_27_34__15_.jpeg', 0.50),
    ('salada-mix',              'WhatsApp_Image_2026-08-15_at_20_27_34__16_.jpeg', 0.50),
    ('salada-campestre',        'WhatsApp_Image_2026-08-15_at_20_27_34__17_.jpeg', 0.50),
    ('couve',                   'WhatsApp_Image_2026-08-15_at_20_27_34__19_.jpeg', 0.52),
    ('mix-tradicional',         'WhatsApp_Image_2026-08-15_at_20_27_34__20_.jpeg', 0.50),
    ('cebola-rodelas',          'WhatsApp_Image_2026-08-15_at_20_27_35__1_.jpeg',  0.52),
    ('kit-caldo-verde',         'WhatsApp_Image_2026-08-15_at_20_27_35__2_.jpeg',  0.52),
    ('rucula',                  'WhatsApp_Image_2026-08-15_at_20_27_35__7_.jpeg',  0.52),
    ('repolho-roxo-verde',      'WhatsApp_Image_2026-08-15_at_20_27_35__8_.jpeg',  0.50),
    ('mix-cenoura-beterraba',   'WhatsApp_Image_2026-08-15_at_20_27_35__9_.jpeg',  0.50),
    ('mix-4-cores',             'WhatsApp_Image_2026-08-15_at_20_27_35__10_.jpeg', 0.50),
    ('mix-5-cores',             'WhatsApp_Image_2026-08-15_at_20_27_35__12_.jpeg', 0.50),
    ('cheiro-verde',            'WhatsApp_Image_2026-08-15_at_20_27_35.jpeg',      0.50),
    ('kit-maionese',            'WhatsApp_Image_2026-08-15_at_20_27_49.jpeg',      0.52),
    ('blend-abacaxi-hortela',   'Abacaxi_com_hortelã.jpeg',          0.52),
    ('chuchu',                  'Chuchu_250g.jpeg',                  0.50),
    ('kit-papinha',             'Kit_papinha-750g.jpeg',             0.52),
    ('kit-refogado',            'Kit_para_refogado.jpeg',            0.52),
    ('kit-seleta',              'Kit_seleta_400g.jpeg',              0.52),
    ('kit-sopao',               'Kit_sopão_400g.jpeg',               0.52),
    ('mix-2-cores',             'Mix_2_cores_250g.jpeg',             0.50),
    ('repolho-roxo',            'Repolho_roxo_250g.jpeg',            0.50),
    ('salada-tradicional-2',    'Salada_tradicional_2_250g.jpeg',    0.50),
    ('mandioca',                'Mandioca_1kg.jpeg',                 0.52),
]


def quadrado(caminho, foco):
    im = Image.open(caminho).convert('RGB')
    W, H = im.size
    if W > H:
        x = int((W - H) * 0.5)
        im = im.crop((x, 0, x + H, H))
    else:
        y = int((H - W) * foco)
        im = im.crop((0, y, W, y + W))
    im = im.resize((LADO, LADO), Image.LANCZOS)
    im = ImageEnhance.Color(im).enhance(1.05)
    return im


os.makedirs(DESTINO, exist_ok=True)
total = 0
for item, arquivo, foco in ITENS:
    destino = f'{DESTINO}/item-{item}.jpg'
    quadrado(os.path.join(ORIGEM, arquivo), foco).save(
        destino, 'JPEG', quality=80, optimize=True, progressive=True)
    total += os.path.getsize(destino)
    print(f'item-{item}.jpg')

print(f'\n{len(ITENS)} miniaturas, {total // 1024} KB no total')
