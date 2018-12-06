<?php
/**
 * .hack//G.U. Data Drain (tm)
 * Copyright (c) 2007 Gold Cartridge.  All rights reserved.
 **/
$flashvars = isset($_SERVER['QUERY_STRING']) ? $_SERVER['QUERY_STRING'] : '';

if($flashvars != '')	$flashvars .= '&';

$flashvars .= 'extdata=' . urlencode('base|http://' . $_SERVER['HTTP_HOST'] . preg_replace("/\\?.+$/", "", $_SERVER['REQUEST_URI']));
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
   "http://www.w3.org/TR/html4/loose.dtd">

<html lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>.hack(r)//G.U.(tm) Data Drain(tm)</title>
	<!-- Date: 2007-07-26 -->
</head>
<body background="images/bkgd.jpg" bgcolor="black" text="white" style="margin:0" marginleft="0" margintop="0" marginright="0" marginbottom="0">
	<table width="100%" height="100%" border="0" cellspacing="0" cellpadding="0">
		<tr>
			<td align="center" valign="center">
				<img src="images/datadrain_logo.png" width="230" height="100" style="behavior:url(iepngfix.htc);">
			</td>
		</tr>
		<tr>
			<td align="center" valign="center">
				<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" width="640" height="480" id="data_drain" align="middle">
					<param name="allowScriptAccess" value="always" />
					<param name="movie" value="datadrain.swf" />
					<param name="quality" value="high" />
					<param name="flashvars" value="<?php echo $flashvars; ?>" />
					
					<embed src="datadrain.swf" quality="high" swliveconnect="true" bgcolor="#ffffff" width="640" height="480" id="data_drain" name="data_drain" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="<?php echo $flashvars; ?>"></embed>
				</object>
			</td>
		</tr>
		<tr>
			<td><img src="images/pixel.gif" width="1" height="20" border="0"></td>
		</tr>
		<tr>
			<td align="center" valign="center">
				<table width="640" height="100%" border="0" cellspacing="0" cellpadding="0">
					<tr>
						<td><a href="http://www.esrb.org/ratings/ratings_guide.jsp" target="_blank"><img src="images/ESRB_T_rating.gif" width="145" height="68" border="0"></a></td>
						<td><img src="images/pixel.gif" width="322" height="68" border="0"></td>
						<td><a href="http://www.goldcartridge.com/" target="_blank"><img src="images/goldcartridge_logo.gif" width="70" height="68" border="0"></a></td>
						<td><img src="images/pixel.gif" width="10" height="33" border="0"></td>
						<td><a href="http://www.namcobandaigames.com/" target="_blank"><img src="images/NBGA_logo.gif" width="70" height="68" border="0"></a></td>
					</tr>
					<tr>
						<td colspan="5"><img src="images/pixel.gif" width="1" height="15" border="0"></td>
					</tr>
					<tr>
						<td width="640" height="68" valign="bottom" border="0" colspan="5">
							<span style="font-family:arial,helvetica,sans-serif; font-size:7pt; color:#000;">.hack&reg; //G.U.&trade; &amp; &copy; 2006, 2007 NAMCO BANDAI. &copy; 2006, 2007 NAMCO BANDAI Games Inc. Rebirth, Reminisce, and Redemption are a trademarks of NAMCO BANDAI Games America.  NAMCO BANDAI Games logo is a trademark of NAMCO BANDAI.  Published and distributed by NAMCO BANDAI Games America Inc. .hack  and related characters, names, logos, distinctive likenesses, drawings and other images contained in this product are the exclusive property of NAMCO BANDAI. Used under license from NAMCO BANDAI. All rights reserved.<br>
								 <br>
							The ratings icon is a registered trademark of the Entertainment Software Association. All other trademarks and trade names are the properties of their respective owners.</span><br><br>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>

</body>
</html>
