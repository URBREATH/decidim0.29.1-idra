class CreateSavedDatasets < ActiveRecord::Migration[6.0]  # Cambia la versione se necessario
  def change
    create_table :saved_datasets, id: :bigint do |t|  # Usa bigint per l'ID
      t.string :title, limit: 255  # Imposta un limite di 255 caratteri per il titolo
      t.bigint :decidim_user_id  # ID utente di decidim (bigint)
      t.string :url, limit: 255  # Imposta un limite di 255 caratteri per l'URL
      t.string :dataset_id, limit: 255  # Imposta un limite di 255 caratteri per il dataset ID
      t.timestamps  # Aggiunge created_at e updated_at
    end
  end
end
