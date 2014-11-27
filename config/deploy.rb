set :application, 'my_app_name'
set :repo_url, 'git@example.com:me/my_repo.git'

# Branch options
# Prompts for the branch name (defaults to current branch)
#ask :branch, -> { `git rev-parse --abbrev-ref HEAD`.chomp }

# Hardcodes branch to always be master
# This could be overridden in a stage config file
set :branch, :master

set :deploy_to, -> { "/srv/www/#{fetch(:application)}" }

set :log_level, :info

# Apache users with .htaccess files:
# it needs to be added to linked_files so it persists across deploys:
# set :linked_files, %w{.env web/.htaccess}
set :linked_files, %w{.env}
set :linked_dirs, %w{web/app/uploads}

namespace :deploy do
  desc 'Restart application'
  task :restart do
    on roles(:app), in: :sequence, wait: 5 do
      # Your restart mechanism here, for example:
      # execute :service, :nginx, :reload
    end
  end
end

namespace :theme do
    task :activate, :roles => :app do
  		run "wp theme activate roots"	
    end
end

after "deploy", "theme:activate"


# The above restart task is not run by default
# Uncomment the following line to run it on deploys if needed
# after 'deploy:publishing', 'deploy:restart'

 

All Gists
lupin72
 
 
Unstar8 
Fork0
 nateroling / deploy.addendum.rb
Last active on 28 Aug
 Code
 Revisions 4
 Stars 8
Embed URL
	
HTTPS clone URL
	
You can clone with HTTPS or SSH.

 Download Gist
Roots Bedrock: Copy production assets for Roots theme
 deploy.addendum.rb Raw
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
# The Roots theme by default does not check production assets into Git, so
# they are not deployed by Capistrano when using the Bedrock stack. The
# following will compile and deploy those assets. Copy this to the bottom of
# your config/deploy.rb file.
 
# Based on information from this thread:
# http://discourse.roots.io/t/capistrano-run-grunt-locally-and-upload-files/2062/7
# and specifically this gist from christhesoul:
# https://gist.github.com/christhesoul/3c38053971a7b786eff2
 
# First we need to set some variables so we know where things are. You should
# only have to modify :theme_path here, :local_app_path and :local_theme_path
# are set from that.
set :theme_path, Pathname.new('web/app/themes/roots')
set :local_app_path, Pathname.new(File.dirname(__FILE__)).join('../')
set :local_theme_path, fetch(:local_app_path).join(fetch(:theme_path))
 
# Next we list the production assets we want to deploy. We could change things
# around so that all our production assets are generated into a single
# directory and upload that, but it would involve touching a lot of things.
# Listing them each explicitly keeps our changes to just the deployment
# configuration.
set :production_assets, [
  'assets/css/main.min.css',
  'assets/js/scripts.min.js',
  'assets/js/vendor/modernizr.min.js',
  'assets/vendor/jquery/dist/jquery.min.js',
  'assets/vendor/bootstrap/fonts/glyphicons-halflings-regular.eot',
  'assets/vendor/bootstrap/fonts/glyphicons-halflings-regular.woff',
  'assets/vendor/bootstrap/fonts/glyphicons-halflings-regular.ttf',
  'assets/vendor/bootstrap/fonts/glyphicons-halflings-regular.svg'].map {|path| Pathname.new(path) }
 
namespace :deploy do
 
  # The :compile_assets task will run 'grunt build' in our theme directory
  # to build the production assets.
  task :compile_assets do
    run_locally do
      within fetch(:local_theme_path) do
        execute :grunt, :build
      end
    end
  end
 
  # The :copy_assets task first runs :compile_assets, then goes through the
  # list of production assets and uploads them to the server. It also creates
  # the target directories if necessary.
  task :copy_assets do
    invoke 'deploy:compile_assets'
    on roles(:web) do
      fetch(:production_assets).each do |path|
        execute :mkdir, "-p", release_path.join(fetch(:theme_path)).join(path.dirname())
        upload! fetch(:local_theme_path).join(path).to_s, release_path.join(fetch(:theme_path)).join(path)
      end
    end
  end
end
 
# This tells Capistrano to copy our production assets to the server after it
# has created the release directory but before it has published the release.
before "deploy:updated", "deploy:copy_assets"
 