<?php

use Roots\Sage\Setup;
use Roots\Sage\Wrapper;

?>

<!doctype html>
<html <?php language_attributes(); ?>>
  <?php get_template_part('templates/head'); ?>
  <body <?php body_class(); ?>>
    <!--[if IE]>
      <div class="alert alert-warning">
        <?php _e('You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.', 'sage'); ?>
      </div>
    <![endif]-->
    <?php
      do_action('get_header');
      //get_template_part('templates/header');
    ?>
	<div class="linee">
		<div class="col-lg-2 col-md-2 col-sm-2 col-xs-2"></div>
		<div class="col-lg-1 col-md-2 col-sm-2 col-xs-2"></div>
		<div class="col-lg-1 col-md-2 col-sm-2 col-xs-2"></div>
		<div class="col-lg-1 col-md-2 col-sm-2 col-xs-2"></div>
		<div class="col-lg-1 col-md-2 col-sm-2 col-xs-2"></div>
		<div class="col-lg-1"></div>
		<div class="col-lg-1 "></div>
		<div class="col-lg-1"></div>
		<div class="col-lg-1"></div>
		<div class="col-lg-1"></div>
		<div class="col-lg-1"></div>
	</div>	
    <div class="wrap" role="document">
      <div>
          <?php if (Setup\display_sidebar()) : ?>
            <aside class="sidebar col-lg-2 col-md-2 col-sm-2 hidden-xs">
              <?php include Wrapper\sidebar_path(); ?>
            </aside><!-- /.sidebar -->
          <?php endif; ?>
        <main class="main col-lg-offset-2 col-md-offset-2 col-sm-offset-2">
		  <?php
			do_action('get_header');
			get_template_part('templates/header');
		  ?>
          <?php include Wrapper\template_path(); ?>
	      <?php
	        do_action('get_footer');
	        get_template_part('templates/footer');
	        wp_footer();
	      ?>
        </main><!-- /.main -->
       
      </div><!-- /.content -->
    </div><!-- /.wrap -->
  </body>
</html>
