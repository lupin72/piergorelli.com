set :stage, :production

# Simple Role Syntax
# ==================
#role :app, %w{deploy@example.com}
#role :web, %w{deploy@example.com}
#role :db,  %w{deploy@example.com}

# Extended Server Syntax
# ======================
#server '195.43.129.219', user: 'root', roles: %w{web app db}
server '178.62.201.7', user: 'serverpilot', roles: %w{web app db}
set :deploy_to, -> { "/srv/users/serverpilot/apps/#{fetch(:application)}/deploy" }

# you can set custom ssh options
# it's possible to pass any option but you need to keep in mind that net/ssh understand limited list of options
# you can see them in [net/ssh documentation](http://net-ssh.github.io/net-ssh/classes/Net/SSH.html#method-c-start)
# set it globally
#  set :ssh_options, {
#    keys: %w(~/.ssh/id_rsa),
#    forward_agent: false,
#    auth_methods: %w(password)
#  }

fetch(:default_env).merge!(wp_env: :production)
set :npm_target_path, -> { release_path.join('web/app/themes/piergorelli') }
set :npm_flags, '--silent'
set :bower_target_path, -> { release_path.join('web/app/themes/piergorelli') }
set :bower_flags, '--allow-root'


set :gulp_file, -> { release_path.join('web/app/themes/piergorelli/gulpfile.js') }

set :wpcli_remote_url, -> {"http://www.corricon.me"}
set :wpcli_local_url, -> {"http://corriconme.dev/"}

set :wpcli_local_uploads_dir, -> {"/Users/pierpaologorelli/Documents/Websites/piergorelli.com/web/app/uploads/"}
#set :wpcli_remote_uploads_dir, -> {"/var/www/htdocs/corr1web/deploy/shared/web/app/uploads/"}
set :wpcli_remote_uploads_dir, -> {"/srv/users/serverpilot/apps/#{fetch(:application)}/deploy/shared/web/app/uploads/"}


after 'deploy:updated', 'gulp'




