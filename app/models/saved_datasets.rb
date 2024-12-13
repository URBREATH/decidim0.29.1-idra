class SavedDatasets < ApplicationRecord
    belongs_to :decidim_user, class_name: 'Decidim::User'
    
    # Validazioni
    validates :title, presence: true, length: { maximum: 255 }
    validates :decidim_user_id, presence: true
    validates :url, presence: true, length: { maximum: 255 }
    validates :dataset_id, presence: true, uniqueness: true, length: { maximum: 255 }
  end
  