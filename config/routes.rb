Rails.application.routes.draw do
  if Rails.env.development?
    mount LetterOpenerWeb::Engine, at: "/letter_opener"
  end


  get "/idra" => "idra#index"

  post "/idra_create" => "idra#create" 
  
  get '/idra_update', to: 'idra#update'

  post '/idra_delete', to: 'idra#delete'

  get '/idra_modal_editor', to: 'idra#modal_editor'

  get 'idra/datasets', to: 'idra#datasets'

  mount Decidim::Core::Engine => '/'
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
end
