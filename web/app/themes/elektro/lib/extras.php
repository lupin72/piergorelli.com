<?php
/**
 * Clean up the_excerpt()
 */
function roots_excerpt_more() {
  return ' &hellip; <a href="' . get_permalink() . '">' . __('Continued', 'roots') . '</a>';
}
add_filter('excerpt_more', 'roots_excerpt_more');

/**
 * Manage output of wp_title()
 */
function roots_wp_title($title) {
  if (is_feed()) {
    return $title;
  }

  $title .= get_bloginfo('name');

  return $title;
}
add_filter('wp_title', 'roots_wp_title', 10);

function load_google_fonts() {
	if( ! defined( 'GOOGLE_FONTS' ) ) return;
	echo '<link href="http://fonts.googleapis.com/css?family=' . GOOGLE_FONTS . '" rel="stylesheet" type="text/css" />'."\n";
}

add_action( 'wp_head', 'load_google_fonts' , 1);

if ( function_exists( 'add_image_size' ) ) { 
	add_image_size( 'home-work', 360, 150, true); 	// work background in home
}