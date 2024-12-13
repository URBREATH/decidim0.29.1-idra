idra_url = "/idra"
idra="Idra"

Decidim.menu :menu do |menu|
    menu.add_item :root,
        idra,
        idra_url,
        position: 6,
        active: :exclusive
end